import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type FilterKey =
  | "globalSearch"
  | "employeeName"
  | "department"
  | "designation"
  | "branch"
  | "role"
  | "status"
  | "createdDateFrom"
  | "createdDateTo";

export interface UserFilters {
  globalSearch: string;
  employeeName: string;
  department: string;
  designation: string;
  branch: string;
  role: string;
  status: string;
  createdDateFrom: string;
  createdDateTo: string;
}

interface UserFilterState {
  filters: UserFilters;
  appliedFilters: UserFilters;
}

const getFormattedDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


export const getDefaultDateRange = () => {
  const today = new Date();

  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - 6);

  return {
    fromDate: getFormattedDate(fromDate),
    toDate: getFormattedDate(today),
  };
};

const defaultDateRange = getDefaultDateRange();

const createDefaultFilters = (): UserFilters => ({
  globalSearch: "",
  employeeName: "",
  department: "",
  designation: "",
  branch: "",
  role: "",
  status: "false",
  createdDateFrom: defaultDateRange.fromDate,
  createdDateTo: defaultDateRange.toDate,
});

const initialFilters: UserFilters = {
  ...createDefaultFilters(),
};

const initialState: UserFilterState = {
  filters: initialFilters,
  appliedFilters: {
    ...initialFilters,
  },
};

const userFilterSlice = createSlice({
  name: "userFilter",
  initialState,
  reducers: {
  
    setUserFilters: (
      state,
      action: PayloadAction<Partial<UserFilters>>,
    ) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    updateAppliedDateFilters: (
      state,
      action: PayloadAction<
        Partial<
          Pick<UserFilters, "createdDateFrom" | "createdDateTo">
        >
      >,
    ) => {
      state.appliedFilters = {
        ...state.appliedFilters,
        ...action.payload,
      };
    },

    applyUserFiltersWithStatus: (
  state,
  action: PayloadAction<string>,
) => {
  state.filters = {
    ...state.filters,
    status: action.payload,
  };

  state.appliedFilters = {
    ...state.filters,
    status: action.payload,
  };
},


    applyUserFilters: (state) => {
      state.appliedFilters = {
        ...state.filters,
      };
    },

    clearUserFilters: (state) => {
      const defaultFilters = createDefaultFilters();
      state.filters = defaultFilters;
      state.appliedFilters = {
        ...defaultFilters,
      };
    },

    resetUserFilters: (state) => {
      const defaultFilters = createDefaultFilters();

      state.filters = defaultFilters;

      state.appliedFilters = {
        ...defaultFilters,
      };
    },
  },
});
export const {
  setUserFilters,
  updateAppliedDateFilters,
  applyUserFilters,
  applyUserFiltersWithStatus,
  clearUserFilters,
  resetUserFilters,
} = userFilterSlice.actions;

export default userFilterSlice.reducer;