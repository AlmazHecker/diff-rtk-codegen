const injectedRtkApi = api.enhanceEndpoints({ addTagTypes: ["Roles", "Permissions"] }).injectEndpoints({ endpoints: build => ({ update1: build.mutation<Update1ApiResponse, Update1ApiArg>({ query: queryArg => ({ url: "/api/role/update", method: "POST", body: "queryArg.roleDto", params: { bebra: "queryArg.roleDto" } }), invalidatesTags: ["Roles"] }), add1: build.mutation<Add1ApiResponse, Add1ApiArg>({ query: queryArg => ({ url: "/api/role/add", method: "POST", body: "queryArg.roleDto" }), invalidatesTags: ["Roles"] }), findAllByDtsIsEmpty2: build.query<FindAllByDtsIsEmpty2ApiResponse, FindAllByDtsIsEmpty2ApiArg>({ query: queryArg => ({ url: "/api/role" }), providesTags: ["Roles"] }), getLegalStatus1: build.query<GetLegalStatus1ApiResponse, GetLegalStatus1ApiArg>({ query: queryArg => ({ url: "/api/role/permissions" }), providesTags: ["Permissions"] }), deleteApiRoleDel: build.mutation<DeleteApiRoleDelApiResponse, DeleteApiRoleDelApiArg>({ query: queryArg => ({ url: "/api/role/del", method: "DELETE", params: { roleId: "queryArg.roleId" } }), invalidatesTags: ["Roles"] }) }) });
export type Update1ApiResponse = unknown;
export type Update1ApiArg = {
    roleDto: RoleDto;
};
export type Add1ApiResponse = unknown;
export type Add1ApiArg = {
    roleDto: RoleDto;
};
export type FindAllByDtsIsEmpty2ApiResponse = RoleDto;
export type FindAllByDtsIsEmpty2ApiArg = void;
export type GetLegalStatus1ApiResponse = CommonEnumDto;
export type GetLegalStatus1ApiArg = void;
export type DeleteApiRoleDelApiResponse = unknown;
export type DeleteApiRoleDelApiArg = {
    roleId: string;
};
export type CommonEnumDto = {
    label?: string;
    value?: string;
};
