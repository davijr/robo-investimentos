import { SearchOptions } from "./SearchOptions";

export interface RequestModel {
    model?: string;
    searchOptions?: SearchOptions;
    data?: any;
}