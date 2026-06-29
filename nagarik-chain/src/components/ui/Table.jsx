import PropTypes from 'prop-types';

function Table({ columns, data, caption, onRowClick, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-left">
        {caption && (
          <caption className="sr-only">{caption}</caption>
        )}
        <thead>
          <tr className="border-b border-brand-navy-light">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-4 py-3 text-brand-muted text-xs font-medium uppercase tracking-wider font-body"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-navy-light">
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              className={`
                hover:bg-brand-navy-light/50 transition-colors
                ${onRowClick ? 'cursor-pointer' : ''}
              `}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3 text-brand-white text-sm font-body"
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
      width: PropTypes.string,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  caption: PropTypes.string,
  onRowClick: PropTypes.func,
  className: PropTypes.string,
};

export default Table;
