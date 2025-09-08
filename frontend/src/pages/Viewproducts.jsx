import { useParams } from "react-router-dom";

function ViewProduct() {
  const { id } = useParams();

  // Example: fetch from dummy data or API
  const product = products.find((p) => p.id === parseInt(id));

  return (
    <div>
      <h1>{product.title}</h1>
      <img src={product.image} alt={product.title} />
      <p>{product.description}</p>
      <h3>Rs.{product.price}</h3>
    </div>
  );
}
