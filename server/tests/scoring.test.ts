import {describe,it,expect} from 'vitest';
import request from 'supertest';
import {scoreReview,type Issue} from '../src/scoring.js';
import {app} from '../src/app.js';
const issues:Issue[]=[{id:'GT-1',category:'bug',file:'a.ts',line:1,description:'bug 1'},{id:'GT-2',category:'security',file:'b.ts',line:2,description:'bug 2'}];
describe('benchmark scoring',()=>{
 it('calculates precision, recall and F1',()=>{const s=scoreReview(issues,{reviewer:'A',findings:[{id:'f1',category:'bug',description:'hit',matchesGroundTruthId:'GT-1'},{id:'f2',category:'bug',description:'false alarm',matchesGroundTruthId:null}]});expect([s.tp,s.fp,s.fn]).toEqual([1,1,1]);expect(s.f1).toBe(.5);});
 it('does not double count duplicate matches',()=>{const s=scoreReview(issues,{reviewer:'A',findings:[{id:'a',category:'bug',description:'first',matchesGroundTruthId:'GT-1'},{id:'b',category:'bug',description:'duplicate',matchesGroundTruthId:'GT-1'}]});expect([s.tp,s.fp,s.fn]).toEqual([1,1,1]);});
 it('handles no findings',()=>{const s=scoreReview(issues,{reviewer:'A',findings:[]});expect([s.precision,s.recall,s.f1]).toEqual([0,0,0]);});
 it('returns full recall when no issues exist',()=>{const s=scoreReview([],{reviewer:'A',findings:[]});expect(s.recall).toBe(1);});
 it('counts unknown ground-truth IDs as false positives',()=>{const s=scoreReview(issues,{reviewer:'A',findings:[{id:'x',category:'bug',description:'not verified',matchesGroundTruthId:'GT-999'}]});expect([s.tp,s.fp,s.fn]).toEqual([0,1,2]);expect(s.findings[0].status).toBe('false-positive');});
 it('does not inflate metrics when ground-truth IDs are duplicated',()=>{const s=scoreReview([...issues,issues[0]],{reviewer:'A',findings:[{id:'x',category:'bug',description:'hit',matchesGroundTruthId:'GT-1'}]});expect([s.tp,s.fp,s.fn]).toEqual([1,0,1]);expect(s.missedIssues.map(i=>i.id)).toEqual(['GT-2']);});
 it('rejects malformed API payload',async()=>{await request(app).post('/api/score').send({reviewer:'x',findings:[{id:2}]}).expect(400);});
 it('rejects whitespace-only fields',async()=>{await request(app).post('/api/score').send({reviewer:' ',findings:[]}).expect(400);});
 it('returns JSON for malformed request bodies',async()=>{const r=await request(app).post('/api/score').set('Content-Type','application/json').send('{');expect(r.status).toBe(400);expect(r.body).toEqual({error:'Invalid JSON payload'});});
 it('serves a health check',async()=>{await request(app).get('/api/health').expect(200,{ok:true});});
 it('serves benchmark fixtures',async()=>{const r=await request(app).get('/api/benchmark').expect(200);expect(r.body.synthetic).toBe(true);expect(r.body.results).toHaveLength(3);});
});
