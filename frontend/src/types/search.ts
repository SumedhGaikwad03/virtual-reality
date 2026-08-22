export type SearchResult = {
  project: {
    id: string;
    name: string;
    slug: string;
    location: {
      name: string;
      slug: string;
    };
    status: "UPCOMING" | "ONGOING" | "READY_TO_MOVE" | "COMPLETED" | "SOLD_OUT";
  };
  developer: {
    id: string;
    name: string;
    slug: string;
  };
  configuration: {
    id: string;
    name: string;
    bhk: number;
    carpetArea: number;
    priceFrom: string;
    availabilityStatus: "AVAILABLE" | "LIMITED" | "SOLD_OUT";
  };
};
