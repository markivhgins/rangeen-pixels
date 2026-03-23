/**
 * panels.js
 * Builds inner HTML for each panel overlay from live data.
 */

// ── Sub-components ───────────────────────────────────────────
const eventItem = ({ day, month, title, info, description }) => `
  <div class="ei">
    <div class="ed">${day}<span class="em">${month}</span></div>
    <div class="eif">
      <h4>${title}</h4><p>${info}</p>
      ${description ? `<p style="margin-top:6px;color:rgba(240,234,216,.5)">${description}</p>` : ''}
    </div>
  </div>`;

const achievementItem = ({ title, desc }) => `
  <div class="ei">
    <div class="ed" style="font-size:1rem;color:var(--gold);min-width:24px">◆</div>
    <div class="eif"><h4>${title}</h4><p>${desc}</p></div>
  </div>`;

const facultyCard = ({ avatar, name, role, dept }) => `
  <div class="mc">
    <div class="ma">${avatar}</div>
    <div class="mn">${name}</div>
    <div class="mr">${role}</div>
    <div style="font-family:'Space Mono',monospace;font-size:.38rem;letter-spacing:.1em;color:rgba(255,255,255,.25);margin-top:3px">${dept}</div>
  </div>`;

const memberCard = ({ avatar, name, role }) => `
  <div class="mc">
    <div class="ma">${avatar}</div>
    <div class="mn">${name}</div>
    <div class="mr">${role}</div>
  </div>`;

const galleryTile = ([emoji, label]) => `
  <div class="gt">${emoji}<div class="gl">${label}</div></div>`;

// ── Panel builders ───────────────────────────────────────────
export function buildGalleryPanel(categories) {
  return {
    tag: 'Work', title: 'Our Gallery',
    html: `
      <div class="panel-body">
        <p>A curated selection from our members' finest work — from campus corridors to distant horizons.</p>
      </div>
      <div class="gg">${categories.map(galleryTile).join('')}</div>`
  };
}

export function buildEventsPanel(events) {
  return {
    tag: 'Event', title: 'Through The Lens',
    html: `
      <div class="panel-body">
        <p>Our flagship photography event — open to all students. Submit your work, attend the showcase, and be part of something memorable.</p>
      </div>
      ${events.map(eventItem).join('')}
      <div class="panel-div"></div>
      <div id="signupSection">
        <div class="panel-tag" style="margin-bottom:10px">◆ REGISTER FOR THE EVENT</div>
        <div class="fg"><label class="fl">Full Name</label>
          <input class="fi" type="text" placeholder="Your name" id="ev-name"></div>
        <div class="fg"><label class="fl">Student Email</label>
          <input class="fi" type="email" placeholder="you@university.edu" id="ev-email"></div>
        <div class="fg"><label class="fl">Department / Year</label>
          <input class="fi" type="text" placeholder="e.g. B.Tech CSE, 2nd Year" id="ev-dept"></div>
        <div class="fg"><label class="fl">What will you submit?</label>
          <select class="fi" style="background:#0b0b0b" id="ev-type">
            <option value="">Select...</option>
            <option value="print">Printed photograph</option>
            <option value="digital">Digital submission</option>
            <option value="both">Both</option>
            <option value="attend">Just attending (no submission)</option>
          </select></div>
        <button class="fb" id="evSignupBtn">CONFIRM REGISTRATION</button>
        <div id="ev-msg" style="margin-top:10px;font-family:'Space Mono',monospace;font-size:.5rem;letter-spacing:.18em;color:var(--gold);display:none;"></div>
      </div>`
  };
}

export function buildMembersPanel(members) {
  if (Array.isArray(members)) {
    return {
      tag: 'People', title: 'The Team',
      html: `
        <div class="panel-body"><p>The people who keep Rangeen Pixels running.</p></div>
        <div class="mg">${members.map(memberCard).join('')}</div>`
    };
  }
  const { coordinators = [], leads = [], members: memberList = [] } = members;
  const section = (label, items) => items.length === 0 ? '' : `
    <div style="margin-bottom:6px">
      <div class="panel-tag" style="margin:16px 0 10px">◆ ${label}</div>
      <div class="mg">${items.map(memberCard).join('')}</div>
    </div>`;
  return {
    tag: 'People', title: 'The Team',
    html: `
      <div class="panel-body"><p>The people who keep Rangeen Pixels running.</p></div>
      ${section('COORDINATORS', coordinators)}
      ${section('LEADS', leads)}
      ${section('MEMBERS', memberList)}`
  };
}

export function buildAboutPanel() {
  return {
    tag: 'Our Story', title: 'About Rangeen Pixels',
    html: `
      <div class="panel-body">
        <p>Rangeen Pixels started with a handful of students and one borrowed camera. Today it's a thriving college photography club, united by a shared obsession with seeing the world through glass.</p>
        <p>We run shoots, workshops, and exhibitions — welcoming everyone from first-time phone photographers to seasoned film shooters.</p>
        <div class="panel-div"></div>
        <p><em>Every person has a unique way of seeing the world. Photography is how you share it.</em></p>
      </div>`
  };
}

export function buildFacultyPanel(faculty) {
  faculty = faculty || [];
  return {
    tag: 'Mentors', title: 'Faculty Advisors',
    html: `
      <div class="panel-body">
        <p>Our faculty advisors bring academic depth, institutional support, and decades of experience to the club.</p>
      </div>
      <div class="mg">${faculty.map(facultyCard).join('')}</div>
      <div class="panel-div"></div>
      <div class="panel-body">
        <p>Faculty advisors are available during club hours and can be reached through the department office.</p>
      </div>`
  };
}

export function buildAchievementsPanel(achievements) {
  achievements = achievements || [];
  return {
    tag: 'Milestones', title: 'Achievements',
    html: `
      <div class="panel-body">
        <p>What we have built, won, and celebrated together.</p>
      </div>
      ${achievements.map(achievementItem).join('')}`
  };
}

export function buildContactPanel() {
  return {
    tag: 'Reach Us', title: 'Contact Us',
    html: `
      <div class="panel-body">
        <p>Got a question, collaboration idea, or just want to connect? We would love to hear from you.</p>
      </div>
      <div class="panel-div"></div>
      <div class="fg"><label class="fl">Your Name</label>
        <input class="fi" type="text" placeholder="Your name" id="ct-name"></div>
      <div class="fg"><label class="fl">Email</label>
        <input class="fi" type="email" placeholder="you@email.com" id="ct-email"></div>
      <div class="fg"><label class="fl">Message</label>
        <textarea class="fi" rows="4" placeholder="What's on your mind?" style="resize:vertical" id="ct-msg"></textarea></div>
      <button class="fb" id="ctSendBtn">SEND MESSAGE</button>
      <div id="ct-status" style="margin-top:10px;font-family:'Space Mono',monospace;font-size:.5rem;letter-spacing:.18em;color:var(--gold);display:none;"></div>
      <div class="panel-div"></div>
      <div class="panel-body">
        <p>You can also find us on Instagram <em>@rangeenpixels</em> or drop by during club hours.</p>
      </div>`
  };
}

// ── Registry ─────────────────────────────────────────────────
export function buildPanels({ categories, events, members, faculty, achievements }) {
  return {
    gallery:      buildGalleryPanel(categories),
    events:       buildEventsPanel(events),
    members:      buildMembersPanel(members),
    about:        buildAboutPanel(),
    faculty:      buildFacultyPanel(faculty),
    achievements: buildAchievementsPanel(achievements),
    contact:      buildContactPanel(),
  };
}
