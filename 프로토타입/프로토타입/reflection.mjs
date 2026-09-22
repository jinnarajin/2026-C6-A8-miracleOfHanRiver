const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function choiceHistory(history,scenes,stage=1){
 const labels={hold:'그대로 둔다',rest:'쉬어 간다',sell:'모두 정리한다',buy:'내 돈으로 산다',borrow:'같은 금액을 빌려 산다',repay:'현금으로 빚을 줄인다',next:'다음 장면으로',pay:'생활비를 결제한다'};
 return `<div class="reflection-history"><h3>지금까지 내가 한 선택</h3>${history.length?`<ol>${history.map(h=>`<li><span>${stage===1?scenes.slice(0,h.turn+1).filter(x=>!x.removed).length:h.turn+1}턴 · ${esc(scenes[h.turn]?.title)}</span><strong>${esc(h.label||labels[h.action]||h.action)}</strong></li>`).join('')}</ol>`:'<p>아직 완료한 선택이 없습니다.</p>'}</div>`;
}

export function appFeedbackFields(){
 return `<label for="app-feedback">앱을 사용하면서 가장 개선되었으면 하는 점은 무엇인가요?</label><select id="app-feedback" name="feedback" required><option value="">선택해 주세요</option><option>화면과 버튼을 더 이해하기 쉽게 해 주세요</option><option>게임 규칙과 설명을 더 명확하게 해 주세요</option><option>진행 속도와 난이도를 조절해 주세요</option><option>투자를 배우는 데 더 도움이 되면 좋겠어요</option><option>지금도 사용하기 좋아요</option><option>기타 의견이 있어요</option></select><label for="app-feedback-note">좋았던 점이나 불편했던 점을 알려 주세요 (선택)</label><textarea id="app-feedback-note" name="note" maxlength="300"></textarea>`;
}
