import type { Schema, Struct } from '@strapi/strapi';

export interface ElementsMenuLink extends Struct.ComponentSchema {
  collectionName: 'components_elements_menu_links';
  info: {
    displayName: 'Menu Link';
    icon: 'link';
  };
  attributes: {
    title: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsMenuSection extends Struct.ComponentSchema {
  collectionName: 'components_elements_menu_sections';
  info: {
    displayName: 'Menu Section';
    icon: 'list';
  };
  attributes: {
    links: Schema.Attribute.Component<'elements.menu-link', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'elements.menu-link': ElementsMenuLink;
      'elements.menu-section': ElementsMenuSection;
    }
  }
}
