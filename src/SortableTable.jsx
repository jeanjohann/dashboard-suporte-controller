import React,{Children,cloneElement,useState} from 'react';
import {compareValues} from './sorting.js';
export {compareValues} from './sorting.js';

export function plainText(value){
  if(value==null||typeof value==='boolean')return '';
  if(typeof value==='string'||typeof value==='number')return String(value);
  if(Array.isArray(value))return value.map(plainText).join(' ');
  return plainText(value.props?.children);
}
export function SortableTable({children,...props}){
  const [sort,setSort]=useState(null);
  return <table {...props}>{Children.map(children,part=>{
    if(part?.type==='thead')return cloneElement(part,{},Children.map(part.props.children,row=>cloneElement(row,{},Children.map(row.props.children,(cell,index)=>cloneElement(cell,{'aria-sort':sort?.index===index?(sort.direction==='asc'?'ascending':'descending'):'none'},<button className="sort-heading" onClick={()=>setSort(previous=>previous?.index===index?previous.direction==='asc'?{index,direction:'desc'}:null:{index,direction:'asc'})}>{cell.props.children} {sort?.index===index?(sort.direction==='asc'?'↑':'↓'):'↕'}</button>)))));
    if(part?.type==='tbody'){
      const rows=Children.toArray(part.props.children);
      const value=row=>{const cell=Children.toArray(row.props.children)[sort?.index];return cell?.props?.['data-sort']??plainText(cell);};
      const ordered=sort?rows.map((row,index)=>({row,index})).sort((a,b)=>compareValues(value(a.row),value(b.row),sort.direction)||a.index-b.index).map(item=>item.row):rows;
      return cloneElement(part,{},ordered);
    }
    return part;
  })}</table>;
}
