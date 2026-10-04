import React, { useState } from 'react';

export function MultiFilter({ label, options, values, disabled, onChange }) {
  const [search,setSearch] = useState('');
  const visible = options.filter(value => value.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
  return <div className="multi-filter"><span>{label}</span><details>
    <summary>{disabled ? 'Coluna ausente' : values.length ? `${values.length} selecionados` : 'Todos'}</summary>
    {!disabled && <div className="multi-options">
      <input aria-label={`Buscar opções de ${label}`} placeholder="Buscar opções…" value={search} onChange={event=>setSearch(event.target.value)}/>
      <button type="button" onClick={()=>{onChange([]);setSearch('');}}>Limpar seleção · Todos</button>
      <div className="option-list">{visible.map(value=><label key={value}><input type="checkbox" checked={values.includes(value)} onChange={event=>onChange(event.target.checked ? [...values,value] : values.filter(item=>item!==value))}/><span>{value || 'Sem dados'}</span></label>)}{!visible.length && <p>Nenhuma opção encontrada.</p>}</div>
    </div>}
  </details>{values.length>0 && <div className="selected-values">{values.map(value=><button key={value} type="button" aria-label={`Remover ${value || 'Sem dados'} de ${label}`} onClick={()=>onChange(values.filter(item=>item!==value))}>{value || 'Sem dados'} ×</button>)}</div>}</div>;
}
