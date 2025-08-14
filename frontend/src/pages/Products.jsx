import React, { useEffect, useState } from "react";
import axios from "axios";

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/api/products")
      .then((result) => setProducts(result.data))
      .catch((error) => console.log(error));
  }, []);

  return(
    <>
      <h1>Products</h1>

      {products.map(product=>(
          <div key={product.id}>
              <div>{product.image}</div>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>{product.category}</p>
              <h3>{product.price}</h3>
          </div>
      ))}
      
    </>
  )
};

export default Products;
