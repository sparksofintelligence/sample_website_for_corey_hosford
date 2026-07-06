export type ProductSeries =
  | "Street Series"
  | "Drift Series"
  | "Track Series"
  | "Accessories";

export type StockStatus = "In Stock" | "Built to Order";

export type IllustrationKind = "coilover" | "brake";

export type DetailSpec = {
  label: string;
  value: string;
};

export type Product = {
  sku: string;
  name: string;
  series: ProductSeries;
  fitment: string;
  specChips: string[];
  price: number;
  stockStatus: StockStatus;
  leadTime?: string;
  detailSpecs: DetailSpec[];
};

export type BrandConfig = {
  name: string;
  parentBrand: string;
  tagline: string;
  subline: string;
  accentColor: string;
  categoryLabel: string;
  announcement: string;
  phone: string;
  email: string;
  address: string;
  trustPoints: {
    title: string;
    text: string;
    icon: "fitment" | "wrench" | "shipping" | "driver";
  }[];
  specialistPoints: {
    title: string;
    text: string;
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
  footerLinks: string[];
};

export type CatalogConfig = {
  categoryLabel: string;
  navLinks: {
    label: string;
    href: string;
  }[];
  heroEyebrow: string;
  heroTitle: string;
  catalogHeading: string;
  catalogIntro: string;
  primaryCta: string;
  secondaryCta: string;
  illustration: IllustrationKind;
  useFilterLabel: string;
  builtToOrderHeading: string;
  builtToOrderText: string;
  productNoun: string;
};

export type CartLine = {
  product: Product;
  quantity: number;
};
