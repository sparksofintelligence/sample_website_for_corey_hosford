"use client";

import Image from "next/image";
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOTIFY_STORAGE_PREFIX = "freedom-performance-notify:";
const GARAGE_STORAGE_KEY = "freedom-performance-garage-chassis";

const notifyStorageKey = (sku: string) => `${NOTIFY_STORAGE_PREFIX}${sku}`;

type FinderUse = "Street" | "Drift" | "Track" | "Not sure";
type FinderChassisOption = {
  key: string;
  label: string;
  make: string;
  order: number;
  showInFinder: boolean;
};

const FINDER_USES: FinderUse[] = ["Street", "Drift", "Track", "Not sure"];
const FITMENT_STEP_LABELS = ["Your chassis", "How you drive", "Result"];
const FINDER_MAKE_ORDER = ["Nissan", "Mazda", "BMW", "Honda", "Toyota/Subaru"];

const seriesForUse = (use: FinderUse): ProductSeries => {
  if (use === "Drift") {
    return "Drift Series";
  }

  if (use === "Track") {
    return "Track Series";
  }

  return "Street Series";
};

const preferredSeriesOrder = (use: FinderUse): ProductSeries[] => {
  const preferred = seriesForUse(use);
  const base: ProductSeries[] = ["Street Series", "Drift Series", "Track Series", "Accessories"];
  return [preferred, ...base.filter((series) => series !== preferred)];
};

const chassisOptionFromFitment = (fitment: string): FinderChassisOption | null => {
  const normalized = fitment.toLowerCase();

  if (normalized.includes("s13/s14")) {
    return { key: "Nissan S-chassis", label: "240SX (S13/S14)", make: "Nissan", order: 4, showInFinder: false };
  }

  if (normalized.includes("240sx") && normalized.includes("s13")) {
    return { key: "Nissan 240SX S13", label: "240SX (S13)", make: "Nissan", order: 0, showInFinder: true };
  }

  if (normalized.includes("240sx") && normalized.includes("s14")) {
    return { key: "Nissan 240SX S14", label: "240SX (S14)", make: "Nissan", order: 1, showInFinder: true };
  }

  if (normalized.includes("s-chassis") || normalized.includes("s chassis")) {
    return { key: "Nissan S-chassis", label: "240SX (S13/S14)", make: "Nissan", order: 4, showInFinder: false };
  }

  if (normalized.includes("350z") || normalized.includes("z33")) {
    return { key: "Nissan 350Z Z33", label: "350Z (Z33)", make: "Nissan", order: 2, showInFinder: true };
  }

  if (normalized.includes("370z") || normalized.includes("z34")) {
    return { key: "Nissan 370Z Z34", label: "370Z (Z34)", make: "Nissan", order: 3, showInFinder: true };
  }

  if (normalized.includes("gr86")) {
    return { key: "Toyota/Subaru GR86 BRZ", label: "GR86 / BRZ", make: "Toyota/Subaru", order: 0, showInFinder: true };
  }

  if (normalized.includes("fr-s")) {
    return { key: "Toyota/Subaru FRS BRZ", label: "FR-S / BRZ", make: "Toyota/Subaru", order: 1, showInFinder: true };
  }

  if (normalized.includes("brz")) {
    return { key: "Subaru BRZ", label: "BRZ", make: "Toyota/Subaru", order: 2, showInFinder: true };
  }

  if (normalized.includes("miata") && normalized.includes("na/nb")) {
    return { key: "Mazda Miata NA/NB", label: "Miata (NA/NB)", make: "Mazda", order: 0, showInFinder: true };
  }

  if (normalized.includes("miata") && normalized.includes("nd")) {
    return { key: "Mazda Miata ND", label: "Miata (ND)", make: "Mazda", order: 1, showInFinder: true };
  }

  if (normalized.includes("e36")) {
    return { key: "BMW 3 Series E36", label: "3 Series (E36)", make: "BMW", order: 0, showInFinder: true };
  }

  if (normalized.includes("e46")) {
    return { key: "BMW 3 Series E46", label: "3 Series (E46)", make: "BMW", order: 1, showInFinder: true };
  }

  if (normalized.includes("civic")) {
    return { key: "Honda Civic EG/EK", label: "Civic (EG/EK)", make: "Honda", order: 0, showInFinder: true };
  }

  if (normalized.includes("s2000")) {
    return { key: "Honda S2000", label: "S2000", make: "Honda", order: 1, showInFinder: true };
  }

  return null;
};

const productMatchesFinderChassis = (product: Product, chassis: string) => {
  const productChassis = chassisOptionFromFitment(product.fitment)?.key;

  if (productChassis === chassis) {
    return true;
  }

  if (productChassis === "Nissan S-chassis" && (chassis === "Nissan 240SX S13" || chassis === "Nissan 240SX S14")) {
    return true;
  }

  return chassis === "Nissan S-chassis" && (productChassis === "Nissan 240SX S13" || productChassis === "Nissan 240SX S14");
};

const whyThisKit = (product: Product, use: FinderUse, chassisLabel: string, isExactMatch: boolean) => {
  const specs = product.specChips.slice(0, 2).join(" and ");
  const seriesName = product.series.replace(" Series", "").toLowerCase();

  if (use === "Not sure") {
    return `Start here: ${specs} gives the ${chassisLabel} a known street baseline before stepping sharper.`;
  }

  if (!isExactMatch) {
    return `${specs} is the closest ${seriesName} option for the ${chassisLabel} while a specialist confirms the ${use.toLowerCase()} setup.`;
  }

  return `${specs} suit ${use.toLowerCase()} driving on the ${chassisLabel}.`;
};

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
  const [notifyForms, setNotifyForms] = useState<Record<string, boolean>>({});
  const [notifyEmails, setNotifyEmails] = useState<Record<string, string>>({});
  const [notifyErrors, setNotifyErrors] = useState<Record<string, string>>({});
  const [notifiedSkus, setNotifiedSkus] = useState<Record<string, true>>({});
  const [finderStep, setFinderStep] = useState(1);
  const [finderChassis, setFinderChassis] = useState<string | null>(null);
  const [finderUse, setFinderUse] = useState<FinderUse | null>(null);
  const [garageChassisKey, setGarageChassisKey] = useState<string | null>(null);

  const finderChassisOptions = useMemo(() => {
    const options = new Map<string, FinderChassisOption>();

    products
      .filter((product) => product.series !== "Accessories")
      .forEach((product) => {
        const option = chassisOptionFromFitment(product.fitment);

        if (option?.showInFinder && !options.has(option.key)) {
          options.set(option.key, option);
        }
      });

    return Array.from(options.values()).sort(
      (a, b) => FINDER_MAKE_ORDER.indexOf(a.make) - FINDER_MAKE_ORDER.indexOf(b.make) || a.order - b.order,
    );
  }, [products]);

  const finderChassisGroups = useMemo(
    () =>
      FINDER_MAKE_ORDER.map((make) => ({
        make,
        options: finderChassisOptions.filter((option) => option.make === make),
      })).filter((group) => group.options.length > 0),
    [finderChassisOptions],
  );

  const selectedFinderChassis = useMemo(
    () => finderChassisOptions.find((option) => option.key === finderChassis) ?? null,
    [finderChassis, finderChassisOptions],
  );

  const selectedGarageChassis = useMemo(
    () => finderChassisOptions.find((option) => option.key === garageChassisKey) ?? null,
    [finderChassisOptions, garageChassisKey],
  );

  const filteredProducts = useMemo(() => {
    const narrowed = products.filter((product) => {
      const chassisMatch = chassis === "All chassis" || productMatchesFinderChassis(product, chassis);
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

  const finderResult = useMemo(() => {
    if (!finderChassis || !finderUse) {
      return {
        exactMatch: false,
        recommendations: [] as Array<{ product: Product; why: string }>,
      };
    }

    const preferredSeries = seriesForUse(finderUse);
    const chassisLabel = selectedFinderChassis?.label ?? finderChassis;
    const chassisProducts = products.filter((product) => productMatchesFinderChassis(product, finderChassis));
    const exactProducts = chassisProducts.filter((product) => product.series === preferredSeries);
    const exactMatch = exactProducts.length > 0;
    const recommendationSource = exactMatch
      ? exactProducts
      : chassisProducts
          .filter((product) => product.series !== "Accessories")
          .sort(
            (a, b) =>
              preferredSeriesOrder(finderUse).indexOf(a.series) -
              preferredSeriesOrder(finderUse).indexOf(b.series),
          );

    const fallbackSource = recommendationSource.length
      ? recommendationSource
      : products
          .filter((product) => product.series === preferredSeries)
          .slice(0, 3);

    return {
      exactMatch,
      recommendations: fallbackSource.slice(0, 3).map((product) => ({
        product,
        why: whyThisKit(product, finderUse, chassisLabel, exactMatch),
      })),
    };
  }, [finderChassis, finderUse, products, selectedFinderChassis]);

  const cartLines = useMemo(() => Object.values(cart), [cart]);
  const cartCount = cartLines.reduce((total, line) => total + line.quantity, 0);
  const subtotal = cartLines.reduce((total, line) => total + line.product.price * line.quantity, 0);
  const heroImage = catalog.heroImage;
  const heroSublineLead = catalog.heroSublineLead ?? brand.heroSublineLead;
  const heroSupportText =
    catalog.heroSupportText ??
    brand.heroSupportText ??
    "Focused house-brand parts for drivers who want fitment checked, stock status clear, and support that knows the chassis.";
  const specialistHeading = catalog.specialistHeading ?? brand.specialistHeading ?? "Why This Store Works";

  useEffect(() => {
    setModalQty(1);
  }, [selectedProduct]);

  useEffect(() => {
    const storedSubmissions: Record<string, true> = {};

    products.forEach((product) => {
      if (window.localStorage.getItem(notifyStorageKey(product.sku))) {
        storedSubmissions[product.sku] = true;
      }
    });

    setNotifiedSkus(storedSubmissions);
  }, [products]);

  useEffect(() => {
    const storedChassis = window.localStorage.getItem(GARAGE_STORAGE_KEY);
    const storedChassisIsAvailable = Boolean(
      storedChassis && finderChassisOptions.some((option) => option.key === storedChassis),
    );

    if (storedChassis && storedChassisIsAvailable) {
      setGarageChassisKey(storedChassis);
      setChassis(storedChassis);
      return;
    }

    setGarageChassisKey(null);
    setChassis((current) =>
      current !== "All chassis" && !finderChassisOptions.some((option) => option.key === current)
        ? "All chassis"
        : current,
    );
  }, [finderChassisOptions]);

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

  const openNotifyForm = (sku: string) => {
    setNotifyForms((current) => ({ ...current, [sku]: true }));
    setNotifyErrors((current) => ({ ...current, [sku]: "" }));
  };

  const updateNotifyEmail = (sku: string, email: string) => {
    setNotifyEmails((current) => ({ ...current, [sku]: email }));
    setNotifyErrors((current) => ({ ...current, [sku]: "" }));
  };

  const submitNotify = (product: Product) => {
    const email = (notifyEmails[product.sku] ?? "").trim();

    if (!EMAIL_PATTERN.test(email)) {
      setNotifyForms((current) => ({ ...current, [product.sku]: true }));
      setNotifyErrors((current) => ({ ...current, [product.sku]: "Enter a valid email address." }));
      return;
    }

    const submission = {
      sku: product.sku,
      email,
      timestamp: new Date().toISOString(),
    };

    window.localStorage.setItem(notifyStorageKey(product.sku), JSON.stringify(submission));
    console.log(submission);

    setNotifiedSkus((current) => ({ ...current, [product.sku]: true }));
    setNotifyForms((current) => ({ ...current, [product.sku]: false }));
    setNotifyErrors((current) => ({ ...current, [product.sku]: "" }));
    setToast(`We'll email you when ${product.sku} is back.`);
  };

  const notifyStateFor = (product: Product) => ({
    email: notifyEmails[product.sku] ?? "",
    error: notifyErrors[product.sku] ?? "",
    isOpen: Boolean(notifyForms[product.sku]),
    submitted: Boolean(notifiedSkus[product.sku]),
  });

  const selectGarageChassis = (chassisKey: string) => {
    setGarageChassisKey(chassisKey);
    setChassis(chassisKey);
    window.localStorage.setItem(GARAGE_STORAGE_KEY, chassisKey);
  };

  const clearGarageChassis = () => {
    setGarageChassisKey(null);
    setChassis("All chassis");
    window.localStorage.removeItem(GARAGE_STORAGE_KEY);
  };

  const scrollToCatalog = () => {
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToChassisSelector = () => {
    document.getElementById("shop-by-chassis")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const shopChassis = (option: FinderChassisOption) => {
    selectGarageChassis(option.key);
    setSeries("All");
    setSort("featured");
    setActiveLink("Kits");
    setMobileOpen(false);
    window.requestAnimationFrame(scrollToCatalog);
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
        <nav className="mx-auto flex min-h-[88px] max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:min-h-[112px] lg:px-8 lg:py-[14px]">
          <a
            href="#hero"
            className="shrink-0"
            onClick={(event) => {
              event.preventDefault();
              setActiveLink("Kits");
              document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <BrandMark
              compact
              logoImage={brand.logoImage}
              className={brand.logoImage ? "h-[64px] w-[64px] lg:h-[84px] lg:w-[84px]" : "h-[46px] w-[150px] sm:h-[54px] sm:w-[180px]"}
            />
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

        {selectedGarageChassis && (
          <div className="border-t border-line bg-asphalt/95 px-4 py-2 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2">
              <span className="rounded-full border border-ignition bg-ignition px-3 py-1 text-xs font-black uppercase text-white">
                Your garage: {selectedGarageChassis.label}
              </span>
              <button
                type="button"
                onClick={scrollToChassisSelector}
                className="rounded-full border border-line px-3 py-1 text-xs font-black uppercase text-white transition hover:border-ignition hover:text-ignition"
              >
                Change
              </button>
              <button
                type="button"
                onClick={clearGarageChassis}
                className="rounded-full border border-line px-3 py-1 text-xs font-black uppercase text-steel transition hover:border-ignition hover:text-white"
              >
                Clear
              </button>
            </div>
          </div>
        )}

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
        {!heroImage && (
          <>
            <div className="absolute inset-0 blueprint-grid opacity-40" />
            <CatalogIllustration
              kind={catalog.illustration}
              accentColor={brand.accentColor}
              className="absolute -right-20 top-12 h-[520px] w-[520px] opacity-[0.13] sm:right-2 lg:right-20 lg:top-4 lg:h-[620px] lg:w-[620px]"
            />
          </>
        )}
        <div
          className={`relative mx-auto max-w-7xl ${
            heroImage
              ? "grid gap-10 lg:min-h-[620px] lg:grid-cols-[minmax(0,0.68fr)_minmax(280px,0.32fr)] lg:items-center lg:gap-12 xl:min-h-[660px] xl:gap-16"
              : "grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center"
          }`}
        >
          <div className={heroImage ? "relative z-10 max-w-4xl" : ""}>
            <p className="mb-5 text-sm font-black uppercase tracking-normal text-ignition sm:text-base">{catalog.heroEyebrow}</p>
            <h1 className="motorsport-heading max-w-5xl text-[3.7rem] text-white sm:text-[7.4rem] lg:text-[7.8rem] xl:text-[8.4rem]">
              {catalog.heroTitle}
            </h1>
            <BrushSlash className="mt-2 h-9 w-full max-w-xl" color={brand.accentColor} />
            <p className="mt-7 max-w-2xl text-xl font-black uppercase text-white sm:text-2xl">
              {heroSublineLead ? `${heroSublineLead} ${brand.subline}` : brand.subline}
            </p>
            <p className="mt-3 max-w-2xl text-base leading-7 text-steel">
              {heroSupportText}
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

          {heroImage && (
            <div className="relative mx-auto flex h-[230px] w-full max-w-[440px] items-center justify-center sm:h-[260px] lg:mr-4 lg:h-[434px] lg:max-h-[70%] lg:max-w-none lg:justify-end xl:mr-8 xl:h-[462px]">
              <Image
                src={heroImage}
                alt=""
                fill
                priority
                sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 32vw, (min-width: 640px) 440px, 92vw"
                className="object-contain"
              />
            </div>
          )}

          {!heroImage && (
            <div className="relative mx-auto flex aspect-[4/5] w-full max-w-[460px] items-center justify-center overflow-hidden rounded-[14px] border border-line bg-panel shadow-card">
              <div className="absolute inset-0 blueprint-grid opacity-50" />
              <CatalogIllustration
                kind={catalog.illustration}
                accentColor={brand.accentColor}
                className="relative h-[88%] w-[88%]"
              />
            </div>
          )}
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

      <section id="shop-by-chassis" className="scroll-mt-32 border-b border-line bg-asphalt px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.62fr_1.38fr] lg:items-start">
            <div>
              <SectionHeading title={catalog.chassisSelectorHeading} eyebrow={catalog.chassisSelectorEyebrow} accentColor={brand.accentColor} />
              <p className="mt-5 max-w-xl text-base leading-7 text-steel">{catalog.chassisSelectorIntro}</p>
            </div>

            <div className="space-y-7">
              {finderChassisGroups.map((group) => (
                <div key={group.make}>
                  <p className="mb-3 text-xs font-black uppercase tracking-normal text-ignition">{group.make}</p>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {group.options.map((option) => {
                      const partCount = products.filter((product) => productMatchesFinderChassis(product, option.key)).length;
                      const isSelected = chassis === option.key;

                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => shopChassis(option)}
                          className={`min-h-28 rounded-[10px] border p-4 text-left transition ${
                            isSelected
                              ? "border-ignition bg-ignition text-white shadow-glow"
                              : "border-line bg-panel text-white hover:border-ignition hover:text-ignition"
                          }`}
                        >
                          <span className="block text-xl font-black italic leading-tight">{option.label}</span>
                          <span className={`mt-3 block text-xs font-black uppercase ${isSelected ? "text-white" : "text-steel"}`}>
                            {partCount} {partCount === 1 ? catalog.productNoun : `${catalog.productNoun}s`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-panel-soft px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.62fr_1.38fr] lg:items-start">
            <div>
              <SectionHeading title={catalog.expertiseHeading} eyebrow={catalog.expertiseEyebrow} accentColor={brand.accentColor} />
              <p className="mt-5 max-w-xl text-base leading-7 text-steel">{catalog.expertiseIntro}</p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {catalog.expertisePoints.map((point) => (
                <article key={point.title} className="rounded-[14px] bg-white p-6 text-asphalt shadow-card">
                  <h3 className="text-xl font-black uppercase italic leading-tight">{point.title}</h3>
                  <p className="mt-4 text-sm font-bold leading-6 text-neutral-700">{point.text}</p>
                </article>
              ))}
            </div>
          </div>
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
            className="sticky top-[92px] z-30 mt-8 rounded-[14px] border border-line bg-panel/95 p-3 shadow-card backdrop-blur"
          >
            <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-end">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase text-steel">Chassis</span>
                <select
                  value={chassis}
                  onChange={(event) => {
                    if (event.target.value === "All chassis") {
                      clearGarageChassis();
                      return;
                    }

                    selectGarageChassis(event.target.value);
                  }}
                  className="h-12 w-full rounded-md border border-line bg-asphalt px-3 text-sm font-bold text-white"
                >
                  <option value="All chassis">All chassis</option>
                  {finderChassisGroups.map((group) => (
                    <optgroup key={group.make} label={group.make}>
                      {group.options.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </optgroup>
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
                  clearGarageChassis();
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
                notifyState={notifyStateFor(product)}
                onNotifyOpen={() => openNotifyForm(product.sku)}
                onNotifyEmailChange={(email) => updateNotifyEmail(product.sku, email)}
                onNotifySubmit={() => submitNotify(product)}
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
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <SectionHeading title={catalog.fitmentFinderHeading} eyebrow={specialistHeading} accentColor={brand.accentColor} />
              <p className="mt-5 max-w-xl text-base leading-7 text-steel">
                {catalog.fitmentFinderIntro}
              </p>

              <div className="mt-8 grid grid-cols-3 gap-2">
                {FITMENT_STEP_LABELS.map((label, index) => {
                  const step = index + 1;
                  const isActive = finderStep === step;
                  const isComplete = finderStep > step;

                  return (
                    <div
                      key={label}
                      className={`rounded-[10px] border px-3 py-3 ${
                        isActive || isComplete ? "border-ignition bg-ignition text-white" : "border-line bg-asphalt text-steel"
                      }`}
                    >
                      <span className="block text-xs font-black uppercase">Step {step}</span>
                      <span className="mt-1 block text-sm font-black uppercase leading-tight">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[14px] border border-line bg-asphalt p-4 shadow-card sm:p-6">
              <div className="flex flex-col justify-between gap-3 border-b border-line pb-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-black uppercase text-ignition">Guided fitment</p>
                  <h3 className="mt-1 text-2xl font-black uppercase italic text-white">
                    {FITMENT_STEP_LABELS[finderStep - 1]}
                  </h3>
                </div>
                {finderStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setFinderStep((step) => Math.max(1, step - 1))}
                    className="w-fit rounded-full border border-line px-5 py-2 text-sm font-black uppercase text-white transition hover:border-ignition hover:text-ignition"
                  >
                    Back
                  </button>
                )}
              </div>

              {finderStep === 1 && (
                <div className="pt-6">
                  <div className="space-y-6">
                    {finderChassisGroups.map((group) => (
                      <div key={group.make}>
                        <p className="mb-2 text-xs font-black uppercase tracking-normal text-steel">{group.make}</p>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {group.options.map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              onClick={() => {
                                selectGarageChassis(option.key);
                                setFinderChassis(option.key);
                                setFinderUse(null);
                                setFinderStep(2);
                              }}
                              className={`rounded-[10px] border px-4 py-4 text-left text-lg font-black italic transition ${
                                finderChassis === option.key
                                  ? "border-ignition bg-ignition text-white"
                                  : "border-line bg-panel text-white hover:border-ignition hover:text-ignition"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {finderStep === 2 && finderChassis && (
                <div className="pt-6">
                  <p className="text-sm font-bold leading-6 text-steel">
                    Chassis selected: <span className="font-black text-white">{selectedFinderChassis?.label ?? finderChassis}</span>
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {FINDER_USES.map((use) => (
                      <button
                        key={use}
                        type="button"
                        onClick={() => {
                          setFinderUse(use);
                          setFinderStep(3);
                        }}
                        className={`rounded-[10px] border px-4 py-5 text-left text-xl font-black uppercase italic transition ${
                          finderUse === use
                            ? "border-ignition bg-ignition text-white"
                            : "border-line bg-panel text-white hover:border-ignition hover:text-ignition"
                        }`}
                      >
                        {use}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {finderStep === 3 && finderChassis && finderUse && (
                <div className="pt-6">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-sm font-bold uppercase text-steel">
                        {selectedFinderChassis?.label ?? finderChassis} / {finderUse}
                      </p>
                      <h4 className="mt-1 text-3xl font-black uppercase italic text-white">
                        {finderResult.exactMatch || finderUse === "Not sure" ? "Recommended kit" : "Closest options"}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFinderStep(1)}
                      className="w-fit rounded-full border border-line px-5 py-2 text-sm font-black uppercase text-white transition hover:border-ignition hover:text-ignition"
                    >
                      Start over
                    </button>
                  </div>

                  {!finderResult.exactMatch && finderUse !== "Not sure" && (
                    <p className="mt-4 rounded-[10px] border border-line bg-panel px-4 py-3 text-sm font-bold leading-6 text-steel">
                      No exact {finderUse.toLowerCase()} match is listed for the {selectedFinderChassis?.label ?? finderChassis}. These are the closest catalog options.
                    </p>
                  )}

                  <div className="mt-5 grid gap-5 xl:grid-cols-3">
                    {finderResult.recommendations.map(({ product, why }) => (
                      <ProductCard
                        key={product.sku}
                        product={product}
                        catalog={catalog}
                        accentColor={brand.accentColor}
                        whyText={why}
                        onOpen={() => setSelectedProduct(product)}
                        onAdd={() => addToCart(product)}
                        notifyState={notifyStateFor(product)}
                        onNotifyOpen={() => openNotifyForm(product.sku)}
                        onNotifyEmailChange={(email) => updateNotifyEmail(product.sku, email)}
                        onNotifySubmit={() => submitNotify(product)}
                      />
                    ))}

                    {!finderResult.exactMatch && (
                      <article className="flex min-h-[560px] flex-col justify-between rounded-[14px] bg-white p-6 text-asphalt shadow-card">
                        <div>
                          <p className="text-xs font-black uppercase text-ignition">No exact match</p>
                          <h4 className="mt-3 text-3xl font-black uppercase italic leading-none">Talk to a specialist</h4>
                          <p className="mt-5 text-sm font-bold leading-6 text-neutral-700">
                            We will confirm chassis details, wheel clearance, and intended use before pointing you at the right {catalog.productNoun}.
                          </p>
                        </div>
                        <a
                          href={`tel:${brand.phone.replace(/-/g, "")}`}
                          className="mt-8 rounded-full bg-ignition px-5 py-3 text-center text-sm font-black uppercase text-white transition hover:bg-asphalt"
                        >
                          {brand.phone}
                        </a>
                      </article>
                    )}
                  </div>
                </div>
              )}
            </div>
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
            <BrandMark
              logoImage={brand.logoImage}
              className={brand.logoImage ? "h-[150px] w-[150px]" : "h-[72px] w-[190px]"}
            />
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
          notifyState={notifyStateFor(selectedProduct)}
          onNotifyOpen={() => openNotifyForm(selectedProduct.sku)}
          onNotifyEmailChange={(email) => updateNotifyEmail(selectedProduct.sku, email)}
          onNotifySubmit={() => submitNotify(selectedProduct)}
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
  whyText?: string;
  onOpen: () => void;
  onAdd: () => void;
  notifyState: NotifyState;
  onNotifyOpen: () => void;
  onNotifyEmailChange: (email: string) => void;
  onNotifySubmit: () => void;
};

type NotifyState = {
  email: string;
  error: string;
  isOpen: boolean;
  submitted: boolean;
};

type NotifyPanelProps = {
  state: NotifyState;
  onOpen: () => void;
  onEmailChange: (email: string) => void;
  onSubmit: () => void;
};

function NotifyPanel({ state, onOpen, onEmailChange, onSubmit }: NotifyPanelProps) {
  if (state.submitted) {
    return (
      <button
        type="button"
        disabled
        className="h-12 w-full rounded-full bg-ignition px-4 text-sm font-black uppercase text-white opacity-70"
      >
        We'll email you
      </button>
    );
  }

  if (!state.isOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="h-12 w-full rounded-full bg-ignition px-4 text-sm font-black uppercase text-white transition hover:bg-asphalt"
      >
        Email me when available
      </button>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="w-full space-y-2"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={state.email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="Email address"
          aria-label="Email address"
          aria-invalid={Boolean(state.error)}
          className="h-12 min-w-0 flex-1 rounded-full border border-neutral-300 px-4 text-sm font-bold text-asphalt outline-none transition focus:border-ignition"
        />
        <button
          type="submit"
          className="h-12 rounded-full bg-ignition px-5 text-sm font-black uppercase text-white transition hover:bg-asphalt"
        >
          Submit
        </button>
      </div>
      {state.error && <p className="px-1 text-xs font-bold text-ignition">{state.error}</p>}
    </form>
  );
}

type ProductVisualProps = {
  product: Product;
  catalog: CatalogConfig;
  accentColor: string;
  className: string;
  sizes: string;
};

function ProductVisual({ product, catalog, accentColor, className, sizes }: ProductVisualProps) {
  if (product.image) {
    const positioningClass = className.includes("absolute") ? "" : "relative";

    return (
      <span className={`${positioningClass} z-0 block ${className}`}>
        <Image src={product.image} alt={product.name} fill sizes={sizes} className="object-contain" />
      </span>
    );
  }

  return <CatalogIllustration kind={catalog.illustration} accentColor={accentColor} className={`relative z-0 ${className}`} />;
}

function ProductCard({
  product,
  catalog,
  accentColor,
  whyText,
  onOpen,
  onAdd,
  notifyState,
  onNotifyOpen,
  onNotifyEmailChange,
  onNotifySubmit,
}: ProductCardProps) {
  const isOutOfStock = product.stockStatus === "Out of Stock";
  const stockClass =
    product.stockStatus === "In Stock"
      ? "border-ignition bg-ignition text-white"
      : isOutOfStock
        ? "border-asphalt bg-asphalt text-white"
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
      <div
        className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[10px] border border-neutral-200 ${
          product.image ? "bg-white" : "bg-panel blueprint-grid"
        }`}
      >
        <div className="absolute left-3 top-3 z-20 rounded-full bg-white px-3 py-1 font-mono text-xs font-black text-asphalt">
          {product.sku}
        </div>
        <div
          className="absolute bottom-3 right-3 z-20 rounded-full px-3 py-1 text-xs font-black uppercase text-white"
          style={{ backgroundColor: accentColor }}
        >
          {product.series.replace(" Series", "")}
        </div>
        <ProductVisual
          product={product}
          catalog={catalog}
          accentColor={accentColor}
          className={
            product.image
              ? "absolute inset-x-7 bottom-9 top-9 transition duration-200 group-hover:scale-[1.03]"
              : "h-[82%] w-[82%] transition duration-200 group-hover:scale-[1.03]"
          }
          sizes="(min-width: 1024px) 280px, (min-width: 640px) 42vw, 80vw"
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

        {whyText && (
          <p className="mt-4 rounded-[10px] bg-neutral-100 px-3 py-3 text-sm font-bold leading-6 text-neutral-700">
            {whyText}
          </p>
        )}

        <div className="mt-auto pt-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${stockClass}`}>
              {product.stockStatus}
            </span>
            {product.leadTime && <span className="text-xs font-black uppercase text-neutral-500">{product.leadTime}</span>}
          </div>
          <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
            {isOutOfStock ? (
              <NotifyPanel
                state={notifyState}
                onOpen={onNotifyOpen}
                onEmailChange={onNotifyEmailChange}
                onSubmit={onNotifySubmit}
              />
            ) : (
              <button
                type="button"
                onClick={onAdd}
                className="w-full rounded-full bg-ignition px-4 py-3 text-sm font-black uppercase text-white transition hover:bg-asphalt"
              >
                Add
              </button>
            )}
          </div>
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
  notifyState: NotifyState;
  onNotifyOpen: () => void;
  onNotifyEmailChange: (email: string) => void;
  onNotifySubmit: () => void;
};

function ProductModal({
  product,
  catalog,
  accentColor,
  quantity,
  setQuantity,
  onClose,
  onAdd,
  notifyState,
  onNotifyOpen,
  onNotifyEmailChange,
  onNotifySubmit,
}: ProductModalProps) {
  const isOutOfStock = product.stockStatus === "Out of Stock";

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
          <div
            className={`relative flex min-h-[320px] items-center justify-center overflow-hidden p-6 ${
              product.image ? "bg-white" : "bg-panel blueprint-grid"
            }`}
          >
            <button
              type="button"
              aria-label="Close product details"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-asphalt text-white transition hover:border-ignition hover:text-ignition md:hidden"
            >
              <LineIcon icon="close" className="h-5 w-5" />
            </button>
            <ProductVisual
              product={product}
              catalog={catalog}
              accentColor={accentColor}
              className="h-[360px] w-[360px]"
              sizes="(min-width: 768px) 360px, 80vw"
            />
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

              {isOutOfStock ? (
                <div className="w-full sm:w-[360px]">
                  <NotifyPanel
                    state={notifyState}
                    onOpen={onNotifyOpen}
                    onEmailChange={onNotifyEmailChange}
                    onSubmit={onNotifySubmit}
                  />
                </div>
              ) : (
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
              )}
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
                    <div
                      className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-[10px] border border-line ${
                        line.product.image ? "bg-white" : "bg-panel-soft blueprint-grid"
                      }`}
                    >
                      <ProductVisual
                        product={line.product}
                        catalog={catalog}
                        accentColor={accentColor}
                        className="h-16 w-16"
                        sizes="64px"
                      />
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
