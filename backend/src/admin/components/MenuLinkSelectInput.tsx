import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Field } from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';

interface MenuSection {
  title: string;
  url?: string | null;
  links?: Array<{ title: string; url: string; sublinks?: Array<{ title: string; url: string }> }>;
}

interface Option {
  value: string;
  label: string;
}

const ANNUAL_THEME_FALLBACK_OPTION: Option = {
  value: '/year-theme',
  label: 'Тематический год',
};

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

function flattenMenuToOptions(mainMenu: MenuSection[] | null | undefined): Option[] {
  const options: Option[] = [{ value: '', label: '— Не выбрано —' }];
  const menu = mainMenu && Array.isArray(mainMenu) && mainMenu.length > 0 ? mainMenu : [];
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
      for (const sub of link.sublinks || []) {
        const subUrl = (sub.url || '').trim();
        if (subUrl) {
          const subUrlNorm = subUrl.startsWith('/') ? subUrl : `/${subUrl}`;
          options.push({
            value: subUrlNorm,
            label: `${section.title || ''} → ${link.title || ''} → ${sub.title || subUrl}`.trim(),
          });
        }
      }
    }
  }
  if (!options.some((opt) => opt.value === ANNUAL_THEME_FALLBACK_OPTION.value)) {
    options.push(ANNUAL_THEME_FALLBACK_OPTION);
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
        .then((res: { data?: { data?: { mainMenu?: MenuSection[] }; mainMenu?: MenuSection[] }; mainMenu?: MenuSection[] }) => {
          if (cancelled) return;
          // Strapi 5: ответ API в res.data, контент single type в res.data.data
          const body = res.data ?? res;
          const mainMenu = body?.data?.mainMenu ?? body?.mainMenu ?? (res as { mainMenu?: MenuSection[] }).mainMenu;
          setOptions(flattenMenuToOptions(mainMenu));
        })
        .catch(() => {
          if (!cancelled) setOptions(flattenMenuToOptions(null));
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
