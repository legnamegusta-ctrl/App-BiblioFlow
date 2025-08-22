
import { computeDays, computePagesPerDay } from '../js/utils.js';
const out = document.getElementById('out');
function log(msg){ out.textContent += msg + '\n'; }
function assertEq(a,b,msg){ if(a!==b) throw new Error(msg+` (got ${a}, expected ${b})`); }
try{
  assertEq(computeDays(100,20), 5, 'computeDays 100/20');
  assertEq(computeDays(0,10), 1, 'computeDays min 1 day');
  assertEq(computePagesPerDay(100,10), 10, 'ppd 100/10');
  assertEq(computePagesPerDay(100,0), 100, 'days=0 treated as 1');
  log('All tests passed ✔️');
}catch(e){ log('Test failed ❌: ' + e.message); }
