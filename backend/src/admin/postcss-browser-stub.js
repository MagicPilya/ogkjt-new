/**
 * Браузерная заглушка для postcss.
 * sanitize-html тянет postcss для разбора атрибутов style; postcss использует path/fs/url,
 * которые не доступны в браузере. Эта заглушка возвращает минимальный AST без Node-зависимостей,
 * в результате разбор style в браузере просто не добавляет стили (безопасно).
 */
module.exports = {
  parse(_css, _opts) {
    return { nodes: [{ type: 'rule', selector: '', nodes: [] }] };
  },
};
