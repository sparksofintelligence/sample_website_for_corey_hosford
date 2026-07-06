"use client";

import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { BrushSlash } from "@/components/BrushSlash";
import { CatalogIllustration, LineIcon } from "@/components/TechIllustrations";
import type { BrandConfig, CartLine, CatalogConfig, Product, ProductSeries } from "@/types/store";

const SERIES_FILTERS: Array<ProductSeries | "All"> = [
  "All",
  "Street Series",
  "Drift Series",
  "Track Series",
  "Accessories",
];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

type StorefrontProps = {
  brand: BrandConfig;
  catalog: CatalogConfig;
  products: Product[];
};

type SortValue = "featured" | "price-asc" | "price-desc";

export function Storefront({ brand, catalog, products }: StorefrontProps) {
  const [chassis, setChassis] = useState("All chassis");
  const [series, setSeries] = useState<ProductSeries | "All">("All");
  const [sort, setSort] = useState<SortValue>("featured");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQty, setModalQty] = useState(1);
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [faqOpen, setFaqOpen] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Kits");

  const chassisOptions = useMemo(
    () => ["All chassis", ...Array.from(new Set(products.map((product) => product.fitment)))],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const narrowed = products.filter((product) => {
      const chassisMatch = chassis === "All chassis" || product.fitment === chassis;
      const seriesMatch = series === "All" || product.series === series;

      return chassisMatch && seriesMatch;
    });

    return [...narrowed].sort((a, b) => {
      if (sort === "price-asc") {
        return a.price - b.price;
      }

      if (sort === "price-desc") {
        return b.price - a.price;
      }

      return products.indexOf(a) - products.indexOf(b);
    });
  }, [chassis, products, series, sort]);

  const cartLines = useMemo(() => Object.values(cart), [cart]);
  const cartCount = cartLines.reduce((total, line) => total + line.quantity, 0);
  const subtotal = cartLines.reduce((total, line) => total + line.product.price * line.quantity, 0);

  useEffect(() => {
    setModalQty(1);
  }, [selectedProduct]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedProduct(null);
        setCartOpen(false);
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedProduct || cartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, selectedProduct]);

  useEffect(() => {
    const sections = [
      { id: "catalog", label: "Kits" },
      { id: "fitment", label: "Fitment" },
      { id: "faq", label: "FAQ" },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);

        if (visible) {
          const match = sections.find((section) => section.id === visible.target.id);
          if (match) {
            setActiveLink(match.label);
          }
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 },
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((current) => ({
      ...current,
      [product.sku]: {
        product,
        quantity: (current[product.sku]?.quantity ?? 0) + quantity,
      },
    }));
    setToast(`Added ${product.sku} to cart`);
  };

  const updateCartQuantity = (sku: string, quantity: number) => {
    setCart((current) => {
      const next = { ...current };

      if (quantity <= 0) {
        delete next[sku];
        return next;
      }

      next[sku] = {
        ...next[sku],
        quantity,
      };

      return next;
    });
  };

  const handleNavClick = (label: string, href: string) => {
    setActiveLink(label);
    setMobileOpen(false);

    if (label === "Drift") {
      setSeries("Drift Series");
    }

    if (label === "Accessories") {
      setSeries("Accessories");
    }

    if (label === "Kits") {
      setSeries("All");
    }

    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="min-h-screen bg-asphalt text-white">
      <div className="border-b border-red-950/50 bg-ignition px-4 py-2 text-center text-xs font-black uppercase tracking-normal text-white sm:text-sm">
        {brand.announcement}
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-asphalt/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <a
            href="#hero"
            className="shrink-0"
            onClick={(event) => {
              event.preventDefault();
              setActiveLink("Kits");
              document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <BrandMark compact className="h-[46px] w-[150px] sm:h-[54px] sm:w-[180px]" />
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {catalog.navLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleNavClick(link.label, link.href)}
                className={`relative px-3 py-2 text-sm font-black uppercase text-white transition hover:text-white ${
                  activeLink === link.label ? "text-white" : "text-steel"
                }`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-3 right-3 h-0.5 bg-ignition transition ${
                    activeLink === link.label ? "opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${brand.phone.replace(/-/g, "")}`}
              className="hidden rounded-full bg-ignition px-4 py-2 text-sm font-black uppercase text-white transition hover:bg-white hover:text-asphalt sm:inline-flex"
            >
              {brand.phone}
            </a>
            <button
              type="button"
              aria-label="Open cart"
              onClick={() => setCartOpen(true)}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-white transition hover:border-ignition hover:text-ignition"
            >
              <LineIcon icon="cart" className="h-6 w-6" />
              <span
                key={cartCount}
                className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-ignition px-1.5 text-xs font-black text-white motion-safe:animate-pulse"
              >
                {cartCount}
              </span>
            </button>
            <button
              type="button"
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-white transition hover:border-ignition hover:text-ignition md:hidden"
            >
              <LineIcon icon={mobileOpen ? "close" : "menu"} className="h-6 w-6" />
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div className="border-t border-line bg-asphalt px-4 py-3 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              {catalog.navLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleNavClick(link.label, link.href)}
                  className="rounded-md border border-line px-4 py-3 text-left text-sm font-black uppercase text-white"
                >
                  {link.label}
                </button>
              ))}
              <a
                href={`tel:${brand.phone.replace(/-/g, "")}`}
                className="rounded-md bg-ignition px-4 py-3 text-center text-sm font-black uppercase text-white"
              >
                {brand.phone}
              </a>
            </div>
          </div>
        )}
      </header>

      <section
        id="hero"
        className="relative isolate overflow-hidden border-b border-line bg-asphalt px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="absolute inset-0 blueprint-grid opacity-40" />
        <CatalogIllustration
          kind={catalog.illustration}
          accentColor={brand.accentColor}
          className="absolute -right-20 top-12 h-[520px] w-[520px] opacity-[0.13] sm:right-2 lg:right-20 lg:top-4 lg:h-[620px] lg:w-[620px]"
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className="mb-5 text-xs font-black uppercase tracking-normal text-ignition">{catalog.heroEyebrow}</p>
            <h1 className="motorsport-heading max-w-4xl text-[4rem] text-white sm:text-[6.6rem] lg:text-[8.5rem]">
              {catalog.heroTitle}
            </h1>
            <BrushSlash className="mt-2 h-9 w-full max-w-xl" color={brand.accentColor} />
            <p className="mt-7 max-w-2xl text-lg font-black uppercase text-white sm:text-xl">{brand.subline}</p>
            <p className="mt-3 max-w-2xl text-base leading-7 text-steel">
              Focused house-brand parts for drivers who want fitment checked, stock status clear, and support that knows the chassis.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => handleNavClick("Kits", "#catalog")}
                className="rounded-full bg-ignition px-6 py-3 text-sm font-black uppercase text-white transition hover:bg-white hover:text-asphalt"
              >
                {catalog.primaryCta}
              </button>
              <button
                type="button"
                onClick={() => handleNavClick("Fitment", "#fitment")}
                className="rounded-full border border-white/60 px-6 py-3 text-sm font-black uppercase text-white transition hover:border-ignition hover:text-ignition"
              >
                {catalog.secondaryCta}
              </button>
            </div>
          </div>

          <div className="relative mx-auto flex aspect-[4/5] w-full max-w-[460px] items-center justify-center overflow-hidden rounded-[14px] border border-line bg-panel shadow-card">
            <div className="absolute inset-0 blueprint-grid opacity-50" />
            <CatalogIllustration
              kind={catalog.illustration}
              accentColor={brand.accentColor}
              className="relative h-[88%] w-[88%]"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-panel-soft px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {brand.trustPoints.map((point) => (
            <div key={point.title} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line text-white">
                <LineIcon icon={point.icon} className="h-7 w-7" accentColor={brand.accentColor} />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase text-white">{point.title}</h2>
                <p className="mt-1 text-sm leading-6 text-steel">{point.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="catalog" className="relative scroll-mt-28 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div id="drift" className="absolute -top-24" />
        <div id="accessories" className="absolute -top-24" />
        <div className="mx-auto max-w-7xl">
          <SectionHeading title={catalog.catalogHeading} eyebrow={catalog.categoryLabel} accentColor={brand.accentColor} />
          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <p className="max-w-2xl text-base leading-7 text-steel">{catalog.catalogIntro}</p>
            <p className="text-sm font-black uppercase text-white">
              {filteredProducts.length} of {products.length} shown
            </p>
          </div>

          <div
            id="fitment-filter"
            className="sticky top-[72px] z-30 mt-8 rounded-[14px] border border-line bg-panel/95 p-3 shadow-card backdrop-blur"
          >
            <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-end">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase text-steel">Chassis</span>
                <select
                  value={chassis}
                  onChange={(event) => setChassis(event.target.value)}
                  className="h-12 w-full rounded-md border border-line bg-asphalt px-3 text-sm font-bold text-white"
                >
                  {chassisOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase text-steel">{catalog.useFilterLabel}</span>
                <select
                  value={series}
                  onChange={(event) => setSeries(event.target.value as ProductSeries | "All")}
                  className="h-12 w-full rounded-md border border-line bg-asphalt px-3 text-sm font-bold text-white"
                >
                  {SERIES_FILTERS.map((option) => (
                    <option key={option} value={option}>
                      {option === "All" ? "All" : option.replace(" Series", "")}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase text-steel">Sort</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortValue)}
                  className="h-12 w-full rounded-md border border-line bg-asphalt px-3 text-sm font-bold text-white"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price low to high</option>
                  <option value="price-desc">Price high to low</option>
                </select>
              </label>

              <button
                type="button"
                onClick={() => {
                  setChassis("All chassis");
                  setSeries("All");
                  setSort("featured");
                }}
                className="h-12 rounded-full border border-line px-5 text-sm font-black uppercase text-white transition hover:border-ignition hover:text-ignition"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.sku}
                product={product}
                catalog={catalog}
                accentColor={brand.accentColor}
                onOpen={() => setSelectedProduct(product)}
                onAdd={() => addToCart(product)}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="mt-8 rounded-[14px] border border-line bg-panel p-8 text-center">
              <p className="text-lg font-black uppercase text-white">No matching parts</p>
              <p className="mt-2 text-sm text-steel">Reset the filters or choose another chassis.</p>
            </div>
          )}
        </div>
      </section>

      <section id="fitment" className="scroll-mt-28 border-y border-line bg-panel-soft px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading title="Why This Store Works" eyebrow="Specialist model" accentColor={brand.accentColor} />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {brand.specialistPoints.map((point) => (
              <article key={point.title} className="rounded-[14px] bg-white p-6 text-asphalt shadow-card">
                <h3 className="text-xl font-black uppercase leading-tight">{point.title}</h3>
                <p className="mt-4 text-sm leading-6 text-neutral-700">{point.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div className="max-w-lg">
            <SectionHeading title={catalog.builtToOrderHeading} eyebrow="Built to order" accentColor={brand.accentColor} />
          </div>
          <p className="text-base leading-8 text-steel">{catalog.builtToOrderText}</p>
        </div>
      </section>

      <section id="faq" className="scroll-mt-28 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <SectionHeading title="FAQ" eyebrow="Answers first" accentColor={brand.accentColor} />
          <div className="mt-8 space-y-4">
            {brand.faq.map((item, index) => {
              const isOpen = faqOpen === index;

              return (
                <div key={item.question} className="overflow-hidden rounded-[14px] bg-white text-asphalt shadow-card">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setFaqOpen(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                  >
                    <span className="text-base font-black uppercase sm:text-lg">{item.question}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-ignition">
                      <LineIcon icon={isOpen ? "minus" : "plus"} className="h-5 w-5" accentColor={brand.accentColor} />
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-200 ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-7 text-neutral-700">{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-panel px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr_1fr]">
          <div>
            <BrandMark className="h-[72px] w-[190px]" />
            <p className="mt-5 max-w-md text-sm leading-7 text-steel">
              Demo storefront. Product data illustrative. A {brand.parentBrand} brand.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-black uppercase text-white">Useful Links</h2>
            <div className="mt-4 grid gap-2">
              {brand.footerLinks.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => handleNavClick(link, link === "FAQ" ? "#faq" : link === "Fitment" ? "#fitment" : "#catalog")}
                  className="w-fit text-sm font-bold text-steel transition hover:text-ignition"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-black uppercase text-white">Mesa, AZ</h2>
            <div className="mt-4 space-y-2 text-sm leading-6 text-steel">
              <p>{brand.address}</p>
              <p>{brand.phone}</p>
              <p>{brand.email}</p>
            </div>
            <div className="mt-5 flex gap-3">
              {["IG", "YT", "FB"].map((label) => (
                <span
                  key={label}
                  aria-label={`${label} social stub`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-xs font-black text-white"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          catalog={catalog}
          accentColor={brand.accentColor}
          quantity={modalQty}
          setQuantity={setModalQty}
          onClose={() => setSelectedProduct(null)}
          onAdd={() => {
            addToCart(selectedProduct, modalQty);
            setSelectedProduct(null);
          }}
        />
      )}

      {cartOpen && (
        <CartDrawer
          lines={cartLines}
          catalog={catalog}
          subtotal={subtotal}
          accentColor={brand.accentColor}
          onClose={() => setCartOpen(false)}
          onUpdateQuantity={updateCartQuantity}
        />
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-full border border-ignition bg-panel px-5 py-3 text-center text-sm font-black uppercase text-white shadow-glow">
          {toast}
        </div>
      )}
    </main>
  );
}

type SectionHeadingProps = {
  title: string;
  eyebrow: string;
  accentColor: string;
};

function SectionHeading({ title, eyebrow, accentColor }: SectionHeadingProps) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-normal text-ignition">{eyebrow}</p>
      <h2 className="motorsport-heading mt-3 text-5xl text-white sm:text-7xl">{title}</h2>
      <BrushSlash className="mt-2 h-7 w-full max-w-sm" color={accentColor} />
    </div>
  );
}

type ProductCardProps = {
  product: Product;
  catalog: CatalogConfig;
  accentColor: string;
  onOpen: () => void;
  onAdd: () => void;
};

function ProductCard({ product, catalog, accentColor, onOpen, onAdd }: ProductCardProps) {
  const stockClass =
    product.stockStatus === "In Stock"
      ? "border-ignition bg-ignition text-white"
      : "border-neutral-300 bg-neutral-100 text-neutral-700";

  return (
    <article
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className="group flex min-h-[560px] cursor-pointer flex-col rounded-[14px] bg-white p-4 text-asphalt shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[10px] border border-neutral-200 bg-panel blueprint-grid">
        <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 font-mono text-xs font-black text-asphalt">
          {product.sku}
        </div>
        <div
          className="absolute bottom-3 right-3 rounded-full px-3 py-1 text-xs font-black uppercase text-white"
          style={{ backgroundColor: accentColor }}
        >
          {product.series.replace(" Series", "")}
        </div>
        <CatalogIllustration
          kind={catalog.illustration}
          accentColor={accentColor}
          className="h-[82%] w-[82%] transition duration-200 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-black uppercase leading-tight">{product.name}</h3>
          <p className="shrink-0 text-lg font-black">{money.format(product.price)}</p>
        </div>
        <p className="mt-3 text-sm font-bold leading-6 text-neutral-700">{product.fitment}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {product.specChips.slice(0, 3).map((chip) => (
            <span key={chip} className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-black uppercase text-neutral-800">
              {chip}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${stockClass}`}>
              {product.stockStatus}
            </span>
            {product.leadTime && <span className="text-xs font-black uppercase text-neutral-500">{product.leadTime}</span>}
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAdd();
            }}
            className="w-full rounded-full bg-ignition px-4 py-3 text-sm font-black uppercase text-white transition hover:bg-asphalt"
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

type ProductModalProps = {
  product: Product;
  catalog: CatalogConfig;
  accentColor: string;
  quantity: number;
  setQuantity: (quantity: number) => void;
  onClose: () => void;
  onAdd: () => void;
};

function ProductModal({
  product,
  catalog,
  accentColor,
  quantity,
  setQuantity,
  onClose,
  onAdd,
}: ProductModalProps) {
  return (
    <div
      role="presentation"
      onClick={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-t-[14px] bg-white text-asphalt shadow-card sm:rounded-[14px]"
      >
        <div className="grid md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-panel blueprint-grid p-6">
            <button
              type="button"
              aria-label="Close product details"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-asphalt text-white transition hover:border-ignition hover:text-ignition md:hidden"
            >
              <LineIcon icon="close" className="h-5 w-5" />
            </button>
            <CatalogIllustration kind={catalog.illustration} accentColor={accentColor} className="h-[360px] w-[360px]" />
          </div>

          <div className="p-5 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-black uppercase text-neutral-500">{product.sku}</p>
                <h2 id="product-modal-title" className="mt-2 text-3xl font-black uppercase leading-tight text-asphalt">
                  {product.name}
                </h2>
                <p className="mt-3 text-sm font-bold leading-6 text-neutral-700">{product.fitment}</p>
              </div>
              <button
                type="button"
                aria-label="Close product details"
                onClick={onClose}
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-asphalt transition hover:border-ignition hover:text-ignition md:flex"
              >
                <LineIcon icon="close" className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {product.specChips.map((chip) => (
                <span key={chip} className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-black uppercase text-neutral-800">
                  {chip}
                </span>
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-[10px] border border-neutral-200">
              {product.detailSpecs.map((spec) => (
                <div key={spec.label} className="grid grid-cols-[0.9fr_1.1fr] border-b border-neutral-200 last:border-b-0">
                  <div className="bg-neutral-50 px-4 py-3 text-xs font-black uppercase text-neutral-500">{spec.label}</div>
                  <div className="px-4 py-3 text-sm font-bold text-asphalt">{spec.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-3xl font-black text-asphalt">{money.format(product.price)}</p>
                <p className="mt-1 text-xs font-black uppercase text-neutral-500">
                  {product.stockStatus}
                  {product.leadTime ? `, ${product.leadTime}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-12 items-center rounded-full border border-neutral-200">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-12 w-12 items-center justify-center text-asphalt"
                  >
                    <LineIcon icon="minus" className="h-5 w-5" accentColor={accentColor} />
                  </button>
                  <span className="min-w-8 text-center text-sm font-black">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-12 w-12 items-center justify-center text-asphalt"
                  >
                    <LineIcon icon="plus" className="h-5 w-5" accentColor={accentColor} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onAdd}
                  className="h-12 rounded-full bg-ignition px-5 text-sm font-black uppercase text-white transition hover:bg-asphalt"
                >
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type CartDrawerProps = {
  lines: CartLine[];
  catalog: CatalogConfig;
  subtotal: number;
  accentColor: string;
  onClose: () => void;
  onUpdateQuantity: (sku: string, quantity: number) => void;
};

function CartDrawer({ lines, catalog, subtotal, accentColor, onClose, onUpdateQuantity }: CartDrawerProps) {
  return (
    <div
      role="presentation"
      onClick={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="flex h-full w-full max-w-md flex-col border-l border-line bg-panel text-white shadow-card"
      >
        <div className="flex items-center justify-between border-b border-line p-5">
          <div>
            <p className="text-xs font-black uppercase text-ignition">Demo cart</p>
            <h2 id="cart-title" className="text-2xl font-black uppercase">
              Your parts
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close cart"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-white transition hover:border-ignition hover:text-ignition"
          >
            <LineIcon icon="close" className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {lines.length === 0 ? (
            <div className="rounded-[14px] border border-line bg-asphalt p-6 text-center">
              <p className="font-black uppercase text-white">Cart is empty</p>
              <p className="mt-2 text-sm text-steel">Add a part to see the demo subtotal.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lines.map((line) => (
                <div key={line.product.sku} className="rounded-[14px] border border-line bg-asphalt p-4">
                  <div className="flex gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[10px] border border-line bg-panel-soft blueprint-grid">
                      <CatalogIllustration kind={catalog.illustration} accentColor={accentColor} className="h-16 w-16" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs font-black uppercase text-steel">{line.product.sku}</p>
                      <h3 className="mt-1 text-sm font-black uppercase text-white">{line.product.name}</h3>
                      <p className="mt-1 text-sm font-black text-white">{money.format(line.product.price)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex h-10 items-center rounded-full border border-line">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => onUpdateQuantity(line.product.sku, line.quantity - 1)}
                        className="flex h-10 w-10 items-center justify-center"
                      >
                        <LineIcon icon="minus" className="h-4 w-4" accentColor={accentColor} />
                      </button>
                      <span className="min-w-7 text-center text-sm font-black">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => onUpdateQuantity(line.product.sku, line.quantity + 1)}
                        className="flex h-10 w-10 items-center justify-center"
                      >
                        <LineIcon icon="plus" className="h-4 w-4" accentColor={accentColor} />
                      </button>
                    </div>
                    <p className="text-sm font-black">{money.format(line.product.price * line.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-line p-5">
          <div className="flex items-center justify-between text-lg font-black uppercase">
            <span>Subtotal</span>
            <span>{money.format(subtotal)}</span>
          </div>
          <button
            type="button"
            disabled
            className="mt-4 h-12 w-full rounded-full bg-neutral-700 text-sm font-black uppercase text-neutral-300"
          >
            Checkout (Demo)
          </button>
        </div>
      </aside>
    </div>
  );
}
