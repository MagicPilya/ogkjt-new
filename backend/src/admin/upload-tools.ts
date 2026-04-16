import { getAdminJwtToken } from './runtime-helpers';

const IMAGE_OPTIMIZER_BUTTON_ID = 'ogkjt-image-optimizer-run-button';

export function ensureImageOptimizerButton(): void {
  const onUploadPluginPage = window.location.pathname.includes('/plugins/upload');
  const existingButton = document.getElementById(IMAGE_OPTIMIZER_BUTTON_ID) as HTMLButtonElement | null;
  if (!onUploadPluginPage) {
    if (existingButton) existingButton.remove();
    return;
  }

  if (existingButton) return;

  const button = document.createElement('button');
  button.id = IMAGE_OPTIMIZER_BUTTON_ID;
  button.type = 'button';
  button.textContent = 'Оптимизировать изображения';
  button.style.position = 'fixed';
  button.style.right = '16px';
  button.style.bottom = '16px';
  button.style.zIndex = '9998';
  button.style.padding = '10px 14px';
  button.style.border = '1px solid rgba(122, 131, 199, 0.55)';
  button.style.borderRadius = '8px';
  button.style.background = 'linear-gradient(180deg, #3f58b4 0%, #2f468f 100%)';
  button.style.color = '#f8f9ff';
  button.style.fontSize = '13px';
  button.style.fontWeight = '600';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
  button.style.transition = 'opacity .15s ease, transform .15s ease';

  button.onmouseenter = () => {
    if (button.disabled) return;
    button.style.transform = 'translateY(-1px)';
  };
  button.onmouseleave = () => {
    button.style.transform = 'translateY(0)';
  };

  button.onclick = async () => {
    if (button.disabled) return;
    const shouldRun = window.confirm(
      'Запустить оптимизацию уже загруженных изображений? Это может занять некоторое время.'
    );
    if (!shouldRun) return;

    const previousText = button.textContent;
    button.disabled = true;
    button.textContent = 'Оптимизация...';
    button.style.opacity = '0.75';
    button.style.cursor = 'wait';

    try {
      const token = getAdminJwtToken();
      const response = await window.fetch('/content-manager/image-optimizer/run', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}),
      });
      const responseText = await response.text();
      let payload: {
        data?: {
          scanned?: number;
          optimized?: number;
          skipped?: number;
          failed?: number;
          totalSavedBytes?: number;
          errors?: Array<{ id?: number; message?: string }>;
        };
        error?: { message?: string };
      } = {};
      try {
        payload = responseText ? (JSON.parse(responseText) as typeof payload) : {};
      } catch {
        payload = {
          error: { message: responseText || `HTTP ${response.status}` },
        };
      }

      if (!response.ok) {
        const errorMessage = payload?.error?.message ?? `HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      const stats = payload.data ?? {};
      const savedMb = Number(((stats.totalSavedBytes ?? 0) / (1024 * 1024)).toFixed(2));
      const errorLines = (stats.errors ?? [])
        .map((errorItem) => `#${errorItem.id ?? '?'}: ${errorItem.message ?? 'Неизвестная ошибка'}`)
        .join('\n');
      const errorBlock = errorLines ? `\n\nОшибки:\n${errorLines}` : '';
      window.alert(
        `Оптимизация завершена.\n` +
          `Проверено: ${stats.scanned ?? 0}\n` +
          `Оптимизировано: ${stats.optimized ?? 0}\n` +
          `Пропущено: ${stats.skipped ?? 0}\n` +
          `С ошибками: ${stats.failed ?? 0}\n` +
          `Сэкономлено: ${savedMb} MB` +
          errorBlock
      );
    } catch (error) {
      window.alert(
        `Не удалось запустить оптимизацию изображений: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      button.disabled = false;
      button.textContent = previousText ?? 'Оптимизировать изображения';
      button.style.opacity = '1';
      button.style.cursor = 'pointer';
      button.style.transform = 'translateY(0)';
    }
  };

  document.body.appendChild(button);
}
