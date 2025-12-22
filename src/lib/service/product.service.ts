import type { IProductItem } from "@/types/product";

import { isNil } from "lodash";

import { http } from "../baseRequest";

const productService = {
    getList: (page?: number, limit?: number): Promise<IProductItem[]> =>
        http.axios.request({
            method: 'GET',
            url: `/products?page=${isNil(page) ? 1 : page}&limit=${isNil(limit) ? 100 : limit}`
        }),

    getDetail: (id: string): Promise<IProductItem> =>
        http.axios.request({
            method: 'GET',
            url: `/products/${id}`
        })
};

export default productService;
