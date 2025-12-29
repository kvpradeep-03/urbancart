# This multistage build uses one container to build things, and a second clean container to run things.

# ---------- builder stage ----------
# In builder stage creates a temporary container whose job is to install build dependencies and compile/install python packages & The builder stage never ships.
FROM python:3.11-slim AS builder

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

# Install deps into a temporary location
RUN pip install --prefix=/install --no-cache-dir -r requirements.txt


# ---------- runtime stage ----------
# In runtime stage we create the final image that ships to production. It only contains runtime dependencies and the application code.
FROM python:3.11-slim

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
COPY --from=builder /install /usr/local

# Copies entire app's code except .dockerignore file
COPY . .

EXPOSE 8000

# Starting the container with gunicorn
CMD ["gunicorn", "urbancart.wsgi:application", "--bind", "0.0.0.0:8000"]
