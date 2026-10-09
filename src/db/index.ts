export * from "./connection";
export * from "./migrator";

// Tipos de Dominio de Persistencia (Fase 05)
export type UserRole = "FARMER" | "BUYER_INDIVIDUAL" | "BUYER_BUSINESS" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";

export interface UserRow {
  id: string;
  email: string;
  phone: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface FarmerProfileRow {
  id: string;
  user_id: string;
  farm_name: string;
  province: string;
  municipality: string;
  sector?: string;
  contact_phone: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface BuyerProfileRow {
  id: string;
  user_id: string;
  buyer_type: "CONSUMER" | "BUSINESS";
  business_name?: string;
  rnc?: string;
  delivery_address?: string;
  contact_phone: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  created_at: string;
}

export type UnitType = "LB" | "QQ" | "CIEN" | "SACO" | "CAJA" | "KG";
export type PublicationStatus = "PREVENTA" | "DISPONIBLE" | "AGOTADO";

export interface PublicationRow {
  id: string;
  farmer_id: string;
  category_id: string;
  title: string;
  variety?: string;
  description?: string;
  unit: UnitType;
  available_quantity: number;
  min_order_quantity: number;
  unit_price: number;
  harvest_date: string;
  status: PublicationStatus;
  province: string;
  municipality: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}
