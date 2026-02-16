import type { Schema, Struct } from '@strapi/strapi';

export interface ElementsAdministrationMember extends Struct.ComponentSchema {
  collectionName: 'components_elements_administration_members';
  info: {
    description: '\u0424\u0418\u041E, \u0434\u043E\u043B\u0436\u043D\u043E\u0441\u0442\u044C, \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u044B, \u0444\u043E\u0442\u043E \u0434\u043B\u044F \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438 \u043D\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435 \u00AB\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F\u00BB';
    displayName: '\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438';
    icon: 'user';
  };
  attributes: {
    contacts: Schema.Attribute.Text;
    fullName: Schema.Attribute.String & Schema.Attribute.Required;
    photo: Schema.Attribute.Media<'images'>;
    position: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

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
      'elements.administration-member': ElementsAdministrationMember;
      'elements.menu-link': ElementsMenuLink;
      'elements.menu-section': ElementsMenuSection;
    }
  }
}
