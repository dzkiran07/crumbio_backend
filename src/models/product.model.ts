import { Schema, model, Document, Types } from "mongoose";

export enum ProductCategory {
  CAKE = "cake",
  BREAD = "bread",
  PASTRY = "pastry",
  COOKIE = "cookie",
  CUPCAKE = "cupcake",
  OTHER = "other",
}

export enum AvailabilityStatus {
  AVAILABLE = "available",
  SOLD_OUT = "sold_out",
  UNLISTED = "unlisted",
}

export interface IProductVariant {
  size: string;
  flavor?: string;
  price: number;
  stock: number;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  category: ProductCategory;
  basePrice: number;
  variants: IProductVariant[];
  images: string[];
  baker: Types.ObjectId;
  bakerName: string;
  availability: AvailabilityStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productVariantSchema = new Schema<IProductVariant>(
  {
    size: { type: String, required: true },
    flavor: { type: String },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: Object.values(ProductCategory), required: true },
    basePrice: { type: Number, required: true, min: 0 },
    variants: { type: [productVariantSchema], default: [] },
    images: { type: [String], default: [] },
    baker: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bakerName: { type: String, required: true },
    availability: {
      type: String,
      enum: Object.values(AvailabilityStatus),
      default: AvailabilityStatus.AVAILABLE,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });

export const ProductModel = model<IProduct>("Product", productSchema);
