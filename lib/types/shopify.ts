export interface ShopifyProductsRequest {
  wid: string;
  searchQuery: string;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  vendor: string;
  productType: string;
  tags: string[];
  variants: ShopifyProductVariant[];
  images: ShopifyProductImage[];
  priceRange: {
    minVariantPrice: string;
    maxVariantPrice: string;
  };
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  price: string;
  sku: string;
  availableForSale: boolean;
}

export interface ShopifyProductImage {
  id: string;
  url: string;
  altText: string;
}

export interface ShopifyProductsResponse {
  products: ShopifyProduct[];
}
