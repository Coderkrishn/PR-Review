export type Issue = { id:string; category:string; file:string; line:number; description:string };
export type Finding = { id:string; category:string; description:string; matchesGroundTruthId:string|null };
export type Review = { reviewer:string; findings:Finding[] };
export function scoreReview(issues:Issue[], review:Review) {
  // Ground-truth IDs are the identity of an issue. Deduplicating here keeps
  // malformed fixture data from inflating FN while still preserving the
  // first issue's display metadata.
  const uniqueIssues = [...new Map(issues.map(issue=>[issue.id, issue])).values()];
  const known = new Set(uniqueIssues.map(i=>i.id));
  const matched = new Set<string>();
  const findings = review.findings.map(f=>{
    const valid = !!f.matchesGroundTruthId && known.has(f.matchesGroundTruthId) && !matched.has(f.matchesGroundTruthId);
    if(valid) matched.add(f.matchesGroundTruthId!);
    return {...f, status:valid?'true-positive':'false-positive'};
  });
  const tp=matched.size, fp=review.findings.length-tp, fn=uniqueIssues.length-tp;
  const precision=tp+fp===0?0:tp/(tp+fp);
  const recall=tp+fn===0?1:tp/(tp+fn);
  const f1=precision+recall===0?0:2*precision*recall/(precision+recall);
  return {reviewer:review.reviewer,tp,fp,fn,precision,recall,f1,findings,missedIssues:uniqueIssues.filter(i=>!matched.has(i.id))};
}
