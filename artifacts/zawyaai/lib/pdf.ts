/**
 * pdf.ts — Générateur de PDFs pour ZawIA
 * Utilise expo-print + expo-sharing
 */

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const BRAND_COLOR = "#4DC8E8";
const ACCENT_COLOR = "#7C3AED";

// ─── Styles CSS communs ────────────────────────────────────────────────────────
const BASE_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, Arial, sans-serif; background: #fff; color: #1a1a1a; }
  .header { background: linear-gradient(135deg, ${BRAND_COLOR}, ${ACCENT_COLOR}); color: white; padding: 32px; }
  .header h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
  .header p { font-size: 14px; opacity: 0.85; margin-top: 6px; }
  .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 10px; }
  .content { padding: 32px; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 16px; font-weight: 700; color: ${BRAND_COLOR}; border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 8px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f5f5f5; padding: 10px 12px; text-align: left; font-weight: 600; color: #555; }
  td { padding: 10px 12px; border-bottom: 1px solid #eee; }
  tr:last-child td { border-bottom: none; }
  .score { display: inline-block; padding: 3px 10px; border-radius: 20px; font-weight: 700; font-size: 13px; }
  .score-good { background: #dcfce7; color: #16a34a; }
  .score-medium { background: #fef9c3; color: #ca8a04; }
  .score-bad { background: #fee2e2; color: #dc2626; }
  .tip { background: #f0f9ff; border-left: 4px solid ${BRAND_COLOR}; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 10px; font-size: 13px; }
  .footer { text-align: center; padding: 20px; color: #999; font-size: 11px; border-top: 1px solid #eee; margin-top: 20px; }
  .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .stat-card { background: #f8f8f8; border-radius: 12px; padding: 16px; text-align: center; }
  .stat-value { font-size: 28px; font-weight: 800; color: ${BRAND_COLOR}; }
  .stat-label { font-size: 12px; color: #888; margin-top: 4px; }
`;

// ─── 1. Plan de tournage ───────────────────────────────────────────────────────
export async function generateScenarioPDF(scenario: {
  title: string;
  hook: string;
  totalDuration: number;
  suggestedLut: string;
  musicMood: string;
  shots: Array<{ n: number; duration: number; shotType: string; angle: string; movement: string; description: string; transition: string }>;
  tips: string[];
}) {
  const shotsRows = scenario.shots.map(s => `
    <tr>
      <td style="font-weight:700;color:${BRAND_COLOR}">${s.n}</td>
      <td>${s.duration}s</td>
      <td>${s.shotType}</td>
      <td>${s.angle}</td>
      <td>${s.movement}</td>
      <td>${s.description}</td>
      <td><span style="background:#f0f9ff;padding:2px 8px;border-radius:4px;font-size:11px">${s.transition}</span></td>
    </tr>
  `).join("");

  const tipsHtml = scenario.tips.map(t => `<div class="tip">💡 ${t}</div>`).join("");

  const html = `
    <!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE_CSS}</style></head>
    <body>
      <div class="header">
        <div style="font-size:13px;opacity:0.7;margin-bottom:8px">ZawIA · Plan de tournage</div>
        <h1>${scenario.title}</h1>
        <p style="font-style:italic;margin-top:8px">"${scenario.hook}"</p>
        <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
          <span class="badge">⏱ ${scenario.totalDuration}s</span>
          <span class="badge">🎨 ${scenario.suggestedLut}</span>
          <span class="badge">🎵 ${scenario.musicMood}</span>
        </div>
      </div>
      <div class="content">
        <div class="section">
          <div class="section-title">Plans de tournage</div>
          <table>
            <thead><tr><th>#</th><th>Durée</th><th>Plan</th><th>Angle</th><th>Mouvement</th><th>Description</th><th>Transition</th></tr></thead>
            <tbody>${shotsRows}</tbody>
          </table>
        </div>
        <div class="section">
          <div class="section-title">Conseils du DOP IA</div>
          ${tipsHtml}
        </div>
      </div>
      <div class="footer">Généré par ZawIA · Startup Algérien · Université d'Oum El Bouaghi 🇩🇿</div>
    </body></html>
  `;

  await printAndShare(html, `ZawIA_Scenario_${scenario.title.replace(/\s+/g, "_")}.pdf`);
}

// ─── 2. Rapport Analytics ──────────────────────────────────────────────────────
export async function generateAnalyticsPDF(data: {
  userName: string;
  totalViews: number;
  totalLikes: number;
  avgScore: number;
  engagement: number;
  topPosts: Array<{ caption: string; score: number; views: number; likes: number; platforms: string[] }>;
  platformBreakdown: Array<{ id: string; views: number; pct: number }>;
}) {
  const topPostsRows = data.topPosts.map((p, i) => `
    <tr>
      <td><span style="background:${i===0?'#fef9c3':i===1?'#f0f9ff':'#f5f5f5'};padding:3px 8px;border-radius:4px;font-weight:700">${i+1}</span></td>
      <td style="max-width:200px">${p.caption.slice(0, 60)}${p.caption.length > 60 ? "..." : ""}</td>
      <td>${p.platforms.join(", ")}</td>
      <td>${(p.views / 1000).toFixed(1)}k</td>
      <td>${(p.likes / 1000).toFixed(1)}k</td>
      <td><span class="score ${p.score>=80?'score-good':p.score>=60?'score-medium':'score-bad'}">${p.score}</span></td>
    </tr>
  `).join("");

  const platformRows = data.platformBreakdown.map(p => `
    <tr>
      <td style="text-transform:capitalize;font-weight:600">${p.id}</td>
      <td>${(p.views / 1000).toFixed(1)}k vues</td>
      <td>
        <div style="background:#eee;border-radius:4px;height:8px;width:100%">
          <div style="background:${BRAND_COLOR};height:8px;border-radius:4px;width:${p.pct}%"></div>
        </div>
      </td>
      <td style="font-weight:700;color:${BRAND_COLOR}">${p.pct}%</td>
    </tr>
  `).join("");

  const html = `
    <!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE_CSS}</style></head>
    <body>
      <div class="header">
        <div style="font-size:13px;opacity:0.7;margin-bottom:8px">ZawIA · Rapport Analytics</div>
        <h1>Rapport de performance</h1>
        <p>${data.userName} · ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</p>
      </div>
      <div class="content">
        <div class="section">
          <div class="section-title">Vue d'ensemble</div>
          <div class="stat-grid">
            <div class="stat-card"><div class="stat-value">${(data.totalViews/1000).toFixed(1)}k</div><div class="stat-label">Vues totales</div></div>
            <div class="stat-card"><div class="stat-value">${data.avgScore}</div><div class="stat-label">Score moyen</div></div>
            <div class="stat-card"><div class="stat-value">${data.engagement}%</div><div class="stat-label">Engagement</div></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Top contenus</div>
          <table>
            <thead><tr><th>#</th><th>Caption</th><th>Plateformes</th><th>Vues</th><th>Likes</th><th>Score</th></tr></thead>
            <tbody>${topPostsRows}</tbody>
          </table>
        </div>
        <div class="section">
          <div class="section-title">Répartition par plateforme</div>
          <table>
            <thead><tr><th>Plateforme</th><th>Vues</th><th>Part</th><th>%</th></tr></thead>
            <tbody>${platformRows}</tbody>
          </table>
        </div>
      </div>
      <div class="footer">Généré par ZawIA · Startup Algérien · Université d'Oum El Bouaghi 🇩🇿</div>
    </body></html>
  `;

  await printAndShare(html, `ZawIA_Analytics_${data.userName}.pdf`);
}

// ─── 3. Brief de collaboration ─────────────────────────────────────────────────
export async function generateCollaborationPDF(data: {
  projectName: string;
  creator: string;
  members: string[];
  photos: number;
  comments: Array<{ user: string; comment: string; time: string }>;
  schedule: Array<{ platform: string; date: string; caption: string }>;
}) {
  const membersHtml = data.members.map(m => `<span style="background:#f0f9ff;border:1px solid ${BRAND_COLOR};padding:4px 12px;border-radius:20px;font-size:13px;margin:4px;display:inline-block">${m}</span>`).join("");

  const commentsHtml = data.comments.map(c => `
    <div style="border-left:3px solid ${BRAND_COLOR};padding:10px 14px;margin-bottom:10px;background:#f8f8f8;border-radius:0 8px 8px 0">
      <div style="font-weight:700;font-size:13px">${c.user} <span style="color:#999;font-weight:400;font-size:11px">· ${c.time}</span></div>
      <div style="margin-top:4px;font-size:13px;color:#444">${c.comment}</div>
    </div>
  `).join("");

  const scheduleRows = data.schedule.map(s => `
    <tr>
      <td style="font-weight:600;text-transform:capitalize">${s.platform}</td>
      <td>${s.date}</td>
      <td>${s.caption.slice(0, 60)}${s.caption.length > 60 ? "..." : ""}</td>
    </tr>
  `).join("");

  const html = `
    <!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE_CSS}</style></head>
    <body>
      <div class="header">
        <div style="font-size:13px;opacity:0.7;margin-bottom:8px">ZawIA · Brief de collaboration</div>
        <h1>${data.projectName}</h1>
        <p>Créé par ${data.creator} · ${data.photos} photos · ${data.members.length} membres</p>
      </div>
      <div class="content">
        <div class="section">
          <div class="section-title">Équipe</div>
          <div>${membersHtml}</div>
        </div>
        <div class="section">
          <div class="section-title">Commentaires (${data.comments.length})</div>
          ${commentsHtml || '<p style="color:#999">Aucun commentaire</p>'}
        </div>
        <div class="section">
          <div class="section-title">Planning de publication</div>
          <table>
            <thead><tr><th>Plateforme</th><th>Date</th><th>Caption</th></tr></thead>
            <tbody>${scheduleRows || '<tr><td colspan="3" style="color:#999;text-align:center">Aucune publication planifiée</td></tr>'}</tbody>
          </table>
        </div>
      </div>
      <div class="footer">Généré par ZawIA · Startup Algérien · Université d'Oum El Bouaghi 🇩🇿</div>
    </body></html>
  `;

  await printAndShare(html, `ZawIA_Brief_${data.projectName.replace(/\s+/g, "_")}.pdf`);
}

// ─── Helper ────────────────────────────────────────────────────────────────────
async function printAndShare(html: string, filename: string) {
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: filename, UTI: "com.adobe.pdf" });
  } else {
    await Print.printAsync({ html });
  }
}
