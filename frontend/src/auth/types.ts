export type AdminRole = "FOUNDER" | "EMPLOYEE";

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  isActive: boolean;
};

export type AdminAccount = {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminLoginResponse = {
  data: {
    accessToken: string;
    admin: AdminUser;
  };
};

export type AdminAccountsListResponse = {
  data: AdminAccount[];
};

export type AdminAccountResponse = {
  data: AdminAccount;
};
