import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compareValues} from './sorting.js';
test('ordena moeda, números, datas e mantém ausências ao final',()=>{assert.ok(compareValues('R$ 99,00','R$ 1.000,00')<0);assert.ok(compareValues(9.5,10.25)<0);assert.ok(compareValues('31/01/2025','01/02/2025')<0);assert.ok(compareValues('2025-01-31','2025-02-01')<0);assert.ok(compareValues('',100,'desc')>0);assert.ok(compareValues('Ana','Bruno')<0);});
test('ordenar antes de paginar mantém menores e maiores no conjunto inteiro',()=>{const values=Array.from({length:120},(_,i)=>120-i);const ordered=[...values].sort((a,b)=>compareValues(a,b));assert.equal(ordered.slice(0,50)[0],1);assert.deepEqual(ordered.slice(100),Array.from({length:20},(_,i)=>101+i));});
