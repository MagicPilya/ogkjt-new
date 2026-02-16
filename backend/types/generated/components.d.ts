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

export interface ElementsSpecializationItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_specialization_items';
  info: {
    description: '\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0438 \u0448\u0438\u0444\u0440 \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438 (\u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0443 \u043E\u0434\u043D\u043E\u0439 \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438)';
    displayName: '\u0421\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F';
    icon: 'layer';
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsSpecialtyItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_specialty_items';
  info: {
    description: '\u041E\u0434\u043D\u0430 \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u044C: \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435, \u0448\u0438\u0444\u0440, \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438, \u043A\u0432\u0430\u043B\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F, \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u0438 \u0440\u0430\u0431\u043E\u0447\u0435\u0433\u043E';
    displayName: '\u0421\u043F\u0435\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u044C';
    icon: 'graduation-cap';
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    qualification: Schema.Attribute.Text;
    specializations: Schema.Attribute.Component<
      'elements.specialization-item',
      true
    >;
    workerProfessions: Schema.Attribute.Component<
      'elements.worker-profession',
      true
    >;
  };
}

export interface ElementsWorkerProfession extends Struct.ComponentSchema {
  collectionName: 'components_elements_worker_professions';
  info: {
    description: '\u041E\u0434\u0438\u043D \u043F\u0443\u043D\u043A\u0442 \u043F\u0435\u0440\u0435\u0447\u0438\u0441\u043B\u0435\u043D\u0438\u044F \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u0439 \u0440\u0430\u0431\u043E\u0447\u0435\u0433\u043E';
    displayName: '\u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u044F \u0440\u0430\u0431\u043E\u0447\u0435\u0433\u043E';
    icon: 'briefcase';
  };
  attributes: {
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'elements.administration-member': ElementsAdministrationMember;
      'elements.menu-link': ElementsMenuLink;
      'elements.menu-section': ElementsMenuSection;
      'elements.specialization-item': ElementsSpecializationItem;
      'elements.specialty-item': ElementsSpecialtyItem;
      'elements.worker-profession': ElementsWorkerProfession;
    }
  }
}
