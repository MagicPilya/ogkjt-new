export type MenuSublink = {
  title: string;
  url: string;
};

export type MenuLink = {
  title: string;
  url: string;
  sublinks?: MenuSublink[];
};

export type MenuSection = {
  title?: string;
  url?: string | null;
  links?: MenuLink[];
};

export type MenuPageItem = {
  pageUrl: string;
  title: string;
};

export type MenuDocument = {
  mainMenu?: MenuSection[];
};
