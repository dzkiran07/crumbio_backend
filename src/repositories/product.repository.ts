import { FilterQuery } from "mongoose";
import { IProduct, ProductModel } from "../models/product.model";

export interface ProductListFilter {
  category?: string;
  baker?: string;
  search?: string;
}

export class ProductRepository {
  create(data: Partial<IProduct>) {
    return ProductModel.create(data);
  }

  findById(id: string) {
    return ProductModel.findOne({ _id: id, isDeleted: false });
  }

  findMany(filter: ProductListFilter) {
    const query: FilterQuery<IProduct> = { isDeleted: false };

    if (filter.category) query.category = filter.category;
    if (filter.baker) query.baker = filter.baker;
    if (filter.search) query.$text = { $search: filter.search };

    return ProductModel.find(query).sort({ createdAt: -1 });
  }

  updateById(id: string, data: Partial<IProduct>) {
    return ProductModel.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
  }

  softDelete(id: string) {
    return ProductModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  }
}

export const productRepository = new ProductRepository();
