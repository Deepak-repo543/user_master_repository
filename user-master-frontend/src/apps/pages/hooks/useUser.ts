import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import {
  fetchUsers,
  searchUsers as searchUsersAction,
  fetchUserById,
  createUser as createUserAction,
  updateUser as updateUserAction,
  deleteUser as deleteUserAction,
  uploadProfileImage as uploadProfileImageAction,
  uploadDigitalSignature as uploadDigitalSignatureAction,
  fetchUserStatusCount,
  clearError,
  clearSingleUser as clearSingleUserAction,
} from "../store/slices/user-slice";
import type { GetUsersParams } from "../store/slices/user-slice";
import { UserRequest } from "../services/user-type";

export const useUser = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    users,
    singleUser,
    loading,
    error,
    currentPage,
    totalPages,
    totalElements,
    totalUsers,
    pageSize,
    statusCount,
  } = useSelector((state: RootState) => state.user);

  const getUsers = useCallback(
    (params: GetUsersParams = {}) => {
      return dispatch(fetchUsers(params));
    },
    [dispatch],
  );

  const getUserById = useCallback(
    async (id: number) => {
      return dispatch(fetchUserById(id)).unwrap();
    },
    [dispatch],
  );

  const searchUsers = useCallback(
    (params: GetUsersParams = {}) => {
      return dispatch(searchUsersAction(params));
    },
    [dispatch],
  );

  const createUser = useCallback(
    async (data: UserRequest[]) => {
      return dispatch(createUserAction(data)).unwrap();
    },
    [dispatch],
  );

  const updateUser = useCallback(
    async (data: UserRequest) => {
      return dispatch(updateUserAction(data)).unwrap();
    },
    [dispatch],
  );
  const uploadProfileImage = useCallback(
    async ({ userId, file }: { userId: number; file: File }) => {
      return dispatch(
        uploadProfileImageAction({
          userId,
          file,
        }),
      ).unwrap();
    },
    [dispatch],
  );

  const uploadDigitalSignature = useCallback(
    async ({ userId, file }: { userId: number; file: File }) => {
      return dispatch(
        uploadDigitalSignatureAction({
          userId,
          file,
        }),
      ).unwrap();
    },
    [dispatch],
  );

  const deleteUser = useCallback(
    async (id: number) => {
      return dispatch(deleteUserAction(id)).unwrap();
    },
    [dispatch],
  );

const getUserStatusCount = useCallback(
  (params?: { fromDate?: string; toDate?: string }) => {
    return dispatch(fetchUserStatusCount(params));
  },
  [dispatch]
);

  const clearSingleUser = useCallback(() => {
    dispatch(clearSingleUserAction());
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    users,
    singleUser,
    loading,
    error,
    currentPage,
    totalPages,
    totalElements,
    totalUsers,
    pageSize,
    statusCount,
    getUsers,
    searchUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    uploadProfileImage,
    uploadDigitalSignature,
    getUserStatusCount,
    clearSingleUser,
    clearError: handleClearError,
  };
};
