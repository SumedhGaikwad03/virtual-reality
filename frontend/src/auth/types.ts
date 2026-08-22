export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
};

export type AdminLoginResponse = {
  data: {
    accessToken: string;
    admin: AdminUser;
  };
};
