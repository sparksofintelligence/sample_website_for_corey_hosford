import { Storefront } from "@/components/Storefront";
import { brand } from "@/data/brand";
// SWAP THIS IMPORT TO CHANGE THE STORE
import { catalog, products } from "@/data/products.coilovers";

export default function Home() {
  return <Storefront brand={brand} catalog={catalog} products={products} />;
}
