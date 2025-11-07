export interface FlowerVariant {
  color: string;
  name: string;
  scientific_name: string;
  symbolism: string[];
  petal_count: {
    min: number;
    max: number;
    typical: number;
  };
  average_diameter_cm: number;
  fragrance: {
    intensity: number;
    description: string;
  };
  blooming_season: string[];
  native_regions: string[];
  care: {
    light: string;
    water: string;
    soil: string;
  };
  image: string;
}

export interface FlowerSpecies {
  species: string;
  variants: FlowerVariant[];
}

export interface FlowerDataset {
  flowers: FlowerSpecies[];
}