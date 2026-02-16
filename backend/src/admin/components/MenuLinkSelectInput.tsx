import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Field } from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';

interface MenuSection {
  title: string;
  url?: string | null;
  links?: Array<{ title: string; url: string }>;
}

interface Option {
  value: string;
  label: string;
}

interface MenuLinkSelectInputProps {
  name: string;
  value: string | null | undefined;
  onChange: (event: { target: { name: string; type: string; value: string } }) => void;
  attribute: { type: string };
  intlLabel: { id?: string; defaultMessage: string };
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

/** Дефолтное меню, если API не вернул данные — селект никогда не пустой. */
const FALLBACK_MENU: MenuSection[] = [
  { title: 'Новости', url: '/news', links: [] },
  { title: 'О колледже', url: '/about', links: [
    { title: 'Администрация', url: '/about/administration' },
    { title: 'Контакты и схема проезда', url: '/about/contacts' },
    { title: 'Символика', url: '/about/symbols' },
    { title: 'Профилактика коррупции', url: '/about/corruption' },
    { title: 'Платные услуги', url: '/about/services' },
    { title: 'История колледжа', url: '/about/history' },
  ]},
  { title: 'Абитуриентам', url: '/applicants', links: [
    { title: 'Специальности', url: '/applicants/specialties' },
    { title: 'План приёма', url: '/applicants/plan' },
    { title: 'Документы', url: '/applicants/documents' },
    { title: 'Информация о местах', url: '/applicants/transfer' },
  ]},
  { title: 'Обучающимся', url: '/students', links: [
    { title: 'Дневное отделение', url: '/students/day' },
    { title: 'Заочное отделение', url: '/students/correspondence' },
    { title: 'Общежитие — Общая информация', url: '/students/dormitory' },
    { title: 'Общежитие — Новости', url: '/students/dormitory/news' },
  ]},
  { title: 'Воспитательная работа', url: '/ideology', links: [
    { title: 'СППС', url: '/ideology/spps' },
    { title: 'Молодёжная политика', url: '/ideology/youth-policy' },
    { title: 'В помощь куратору', url: '/ideology/curator' },
  ]},
  { title: 'Одно окно', url: '/one-window', links: [] },
  { title: 'Электронные обращения', url: '/appeals', links: [] },
];

function flattenMenuToOptions(mainMenu: MenuSection[] | null | undefined): Option[] {
  const options: Option[] = [{ value: '', label: '— Не выбрано —' }];
  const menu = mainMenu && Array.isArray(mainMenu) && mainMenu.length > 0 ? mainMenu : FALLBACK_MENU;
  for (const section of menu) {
    const sectionUrl = section.url?.trim() || '';
    if (sectionUrl) {
      options.push({
        value: sectionUrl.startsWith('/') ? sectionUrl : `/${sectionUrl}`,
        label: section.title || sectionUrl,
      });
    }
    for (const link of section.links || []) {
      const linkUrl = (link.url || '').trim();
      if (linkUrl) {
        const url = linkUrl.startsWith('/') ? linkUrl : `/${linkUrl}`;
        options.push({
          value: url,
          label: `${section.title || ''} → ${link.title || linkUrl}`.trim(),
        });
      }
    }
  }
  return options;
}

const MenuLinkSelectInput = React.forwardRef<HTMLSelectElement, MenuLinkSelectInputProps>(
  ({ name, value, onChange, attribute, intlLabel, required, disabled, error }, ref) => {
    const { formatMessage } = useIntl();
    const { get } = useFetchClient();
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      get('/api/menu?populate[mainMenu][populate]=*')
        .then((res: { data?: { mainMenu?: MenuSection[] }; mainMenu?: MenuSection[] }) => {
          if (cancelled) return;
          const mainMenu = res.data?.mainMenu ?? (res as { mainMenu?: MenuSection[] }).mainMenu;
          setOptions(flattenMenuToOptions(mainMenu));
        })
        .catch(() => {
          if (!cancelled) setOptions(flattenMenuToOptions(FALLBACK_MENU));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [get]);

    const currentValue = value ?? '';

    const label = formatMessage({
      id: intlLabel?.id ?? 'menu-link-select.label',
      defaultMessage: intlLabel?.defaultMessage ?? 'Страница',
    });

    return (
      <Field.Root error={error} required={required}>
        <Field.Label>{label}</Field.Label>
        <select
          ref={ref}
          name={name}
          value={currentValue}
          onChange={(e) => onChange({ target: { name, type: attribute.type, value: e.target.value } })}
          disabled={disabled || loading}
          style={{ width: '100%', padding: '8px 12px', marginTop: 4 }}
        >
          {options.map((opt) => (
            <option key={opt.value || 'empty'} value={opt.value}>
              {loading && opt.value === '' ? 'Загрузка…' : opt.label}
            </option>
          ))}
        </select>
      </Field.Root>
    );
  }
);

MenuLinkSelectInput.displayName = 'MenuLinkSelectInput';

export default MenuLinkSelectInput;
