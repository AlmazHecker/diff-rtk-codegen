import { baseApi as api } from "../../../shared/api/baseApi";

let variable = 10;

const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes: ["Roles", "Permissions"],
  })

  .injectEndpoints({
    endpoints: (build) => ({
      update1: build.mutation<Update1ApiResponse, Update1ApiArg>({
        query: (queryArg) => ({
          url: `/api/role/update`,
          method: "POST",
          body: queryArg.roleDto,

          responseHandler: (bobr) => bobr.json(),
        }),
        bebrachka: (test = "random") => {
          const bebrov = 123;
          return "tester" + bebrov;
        },
        // responseHandler: (bobr) => "bebrachka",
        invalidatesTags: ["Roles"],
        phone: {
          random: "test",
        },
      }),
      deleteApiRoleDel: build.mutation<
        DeleteApiRoleDelApiResponse,
        DeleteApiRoleDelApiArg
      >({
        query: (queryArg) => ({
          url: `/api/role/del`,
          method: "DELETE",
          params: { roleId: queryArg.roleId },
        }),
        invalidatesTags: ["Roles"],
      }),
      add1: build.mutation<Add1ApiResponse, Add1ApiArg>({
        query: (queryArg) => ({
          url: `/api/role/add`,
          method: "POST",
          body: queryArg.roleDto,
        }),
        invalidatesTags: ["Roles"],
      }),
      findAllByDtsIsEmpty2: build.query<
        FindAllByDtsIsEmpty2ApiResponse,
        FindAllByDtsIsEmpty2ApiArg
      >({
        query: () => ({ url: `/api/role` }),
        providesTags: ["Roles"],
      }),
      getLegalStatus1: build.query<
        GetLegalStatus1ApiResponse,
        GetLegalStatus1ApiArg
      >({
        query: () => ({ url: `/api/role/permissions` }),
        providesTags: ["Permissions"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as rolesApi };
export type Update1ApiResponse = unknown;
export type Update1ApiArg = {
  roleDto: RoleDto;
};
export type PostApiRoleDelApiResponse = unknown;
export type PostApiRoleDelApiArg = {
  body: string;
};
export type Add1ApiResponse = unknown;
export type Add1ApiArg = {
  roleDto: RoleDto;
};
export type DeleteApiRoleDelApiResponse = unknown;
export type DeleteApiRoleDelApiArg = {
  roleId: string;
};
export type FindAllByDtsIsEmpty2ApiResponse =
  /** status 200 Список ролей успешно возвращен */ RoleDto[];
export type FindAllByDtsIsEmpty2ApiArg = void;
export type GetLegalStatus1ApiResponse =
  /** status 200 Список прав успешно возвращен */ CommonEnumDto[];
export type GetLegalStatus1ApiArg = void;
export type RoleDto = {
  id?: string;
  name?: string;
  permissions?: string[];
};
export type PermissionType =
  | "USER"
  | "ROLE"
  | "LOAN"
  | "LOAN_ROLE"
  | "LOAN_USER"
  | "LOAN_FLOW"
  | "CHANGE_LEGAL_STATUS"
  | "NOTIFICATION_TEXT"
  | "REPORT_BY_LEGAL_DOCUMENT"
  | "CONFIGURATION"
  | "CHANGE_LEGAL_USER_STATUS";
export type CommonEnumDto = {
  label: string;
  value: string;
};
export const {
  useUpdate1Mutation,
  useDeleteApiRoleDelMutation,
  useAdd1Mutation,
  useFindAllByDtsIsEmpty2Query,
  useGetLegalStatus1Query,
} = injectedRtkApi;
