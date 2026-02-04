# This multistage build uses one container to build things, and a second clean container to run things.

# ---------- builder stage ----------
# In builder stage creates a temporary container whose job is to install build dependencies and compile/install python packages & The builder stage never ships.

# FRONTEND BUILD
FROM node:18 AS frontend-builder

WORKDIR /app/frontend

# passing build time variable from docker build command
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY frontend/package*.json ./

# here we didnt install dependencies into seperate folder /install like we done on python-builder because node modules are needed only for building the frontend and not needed at runtime.
RUN npm install

COPY frontend/ ./
# here these build provides /dist folder which contains all the static files (html, css, js, images) needed for frontend.
RUN npm run build

# PYTHON DEP BUILD
FROM python:3.11-slim AS python-builder

# Stops Python from writing pyc files to disc
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Build dependencies (here heavy tools, headers and dependencies like gcc are installed which are not needed at runtime)
# Each RUN, COPY, and ADD instruction creates new immutable layer causes image bloat and slow build times. To optimize this we combine multiple commands into a single RUN instruction.
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install deps into a temporary location (/install) so that we can copy them to the final image later
RUN pip install --prefix=/install --no-cache-dir -r requirements.txt


# ---------- runtime stage ----------
# In runtime stage we create the final image that ships to production. It only contains runtime dependencies and the application code.
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Runtime deps only (mysql client lib, no gcc)
# We install mariadb client library as mysqlclient python package due to comatibility issue with python:3.11-slim (based on Debian trixie)
RUN apt-get update && apt-get install -y \
    libmariadb3 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed python packages 
# In builder stage we installed all python packages into /install directory. Here we copy the results of those installed packages into the final image.
COPY --from=python-builder /install /usr/local

# Copies entire app's code except .dockerignore file
COPY . .

# copy built frontend into Django static root
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# collect static files (moves everything into /staticfiles)
RUN python manage.py collectstatic --noinput

#Render defaults to port 10000 for Docker Image mode
EXPOSE 10000

# Starting the container with gunicorn
# while building we have to pass a build-arg VITE_API_URL to the docker build command like, docker build --build-arg VITE_API_URL=http://localhost:8000/api -t urbancart:dev . while in pipeline we are passing it from GitHub secrets.
# Here $PORT is a runtime variable provided by Render, it dynamically assigns a port for the web service.
# while to spinup the container locally we have to supply the $PORT as a env variable, docker run -p 8000:8000 -e PORT=8000 --env-file .env urbancart:dev
# sh allows to use shell features like variable substitution. and -c allows us to pass the entire command as a single string.
CMD ["sh", "-c", "gunicorn urbancart.wsgi:application --bind 0.0.0.0:$PORT"]

