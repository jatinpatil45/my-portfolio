/**
 * Knowledge Graph for Jatin AI 3.0
 *
 * Connects:
 * 1. Skills <-> Projects
 * 2. Projects <-> Technologies
 * 3. Achievements <-> Activities & Experience
 * 4. Structured Knowledge Items via `relatedIds`
 *
 * Works 100% client-side with zero external dependencies.
 */

import defaultKnowledge, { retrieveKnowledge as baseRetrieveKnowledge } from './chatbotKnowledge';

export const RELATION_TYPES = {
  USES_SKILL: 'USES_SKILL',
  SKILL_USED_IN_PROJECT: 'SKILL_USED_IN_PROJECT',
  PROJECT_USES_TECH: 'PROJECT_USES_TECH',
  BELONGS_TO_DOMAIN: 'BELONGS_TO_DOMAIN',
  CERTIFIES_SKILL: 'CERTIFIES_SKILL',
  ACHIEVEMENT_ACTIVITY: 'ACHIEVEMENT_ACTIVITY',
  STUDIED_AT: 'STUDIED_AT',
  ACHIEVED: 'ACHIEVED',
  RELATED_KNOWLEDGE: 'RELATED_KNOWLEDGE',
};

/**
 * Builds an in-memory knowledge graph from the structured knowledge base.
 *
 * @param {object} [knowledge=defaultKnowledge]
 */
export function createKnowledgeGraph(knowledge = defaultKnowledge) {
  const kb = knowledge || defaultKnowledge;
  const nodes = new Map();
  const edges = [];

  const addNode = (id, type, label, data = {}) => {
    nodes.set(id, { id, type, label, data });
  };

  const addEdge = (from, to, relation, weight = 1) => {
    edges.push({ from, to, relation, weight });
  };

  // 1. Person root node
  const personId = 'person:jatin';
  addNode(personId, 'person', kb.personalIntroduction?.name || 'Jatin Patil', kb.personalIntroduction);

  // 2. Register all structured knowledge items as nodes
  for (const item of kb.allKnowledgeItems || []) {
    if (item && item.id) {
      addNode(item.id, item.knowledgeCategory || item.category || 'knowledge', item.title, item);
    }
  }

  // 3. Domain nodes
  const domains = ['AI/ML', 'Full Stack', 'Deep Learning', 'Web', 'Data Science', 'Cybersecurity'];
  for (const domain of domains) {
    addNode(`domain:${domain.toLowerCase()}`, 'domain', domain);
  }

  // 4. Skill & Technology nodes
  const skillBuckets = [
    { category: 'Core Programming', items: kb.technicalSkills?.coreProgramming || [] },
    { category: 'Additional Languages', items: kb.technicalSkills?.additionalLanguages || [] },
    { category: 'Web Development', items: kb.technicalSkills?.webDevelopment || [] },
    { category: 'Data Science & AI', items: kb.technicalSkills?.dataScienceAndAI || [] },
    { category: 'Cybersecurity & Cloud', items: kb.technicalSkills?.cybersecurityAndCloud || [] },
    { category: 'Tools & Platforms', items: kb.technicalSkills?.toolsAndPlatforms || [] },
  ];

  for (const bucket of skillBuckets) {
    for (const skill of bucket.items) {
      const normalizedSkill = skill.toLowerCase().replace(/\s*\(currently learning\)/i, '').trim();
      const skillId = `skill:${normalizedSkill}`;
      addNode(skillId, 'skill', skill, { category: bucket.category, cleanName: normalizedSkill });
    }
  }

  // 5. Connect Projects <-> Technologies & Skills <-> Projects
  for (let i = 0; i < (kb.projects || []).length; i++) {
    const project = kb.projects[i];
    const projectId = project.id || `project:${i}`;
    addNode(projectId, 'project', project.title, { ...project, index: i });

    if (project.category) {
      const domainId = `domain:${project.category.toLowerCase()}`;
      if (!nodes.has(domainId)) {
        addNode(domainId, 'domain', project.category);
      }
      addEdge(projectId, domainId, RELATION_TYPES.BELONGS_TO_DOMAIN);
    }

    for (const tech of project.tech || []) {
      const cleanTech = tech.toLowerCase().trim();
      const techId = `skill:${cleanTech}`;
      if (!nodes.has(techId)) {
        addNode(techId, 'skill', tech, { category: 'Project Tech', cleanName: cleanTech });
      }
      // Bidirectional graph edges: Project -> Tech and Skill -> Project
      addEdge(projectId, techId, RELATION_TYPES.USES_SKILL);
      addEdge(projectId, techId, RELATION_TYPES.PROJECT_USES_TECH);
      addEdge(techId, projectId, RELATION_TYPES.SKILL_USED_IN_PROJECT);
    }
  }

  // 6. Connect Certifications -> Skills
  for (let i = 0; i < (kb.certifications || []).length; i++) {
    const cert = kb.certifications[i];
    const certId = cert.id || `cert:${i}`;
    addNode(certId, 'certification', cert.title, cert);

    for (const skillName of cert.skills || []) {
      const skillId = `skill:${skillName.toLowerCase()}`;
      if (!nodes.has(skillId)) {
        addNode(skillId, 'skill', skillName, {
          category: 'Certified Skill',
          cleanName: skillName.toLowerCase(),
        });
      }
      addEdge(certId, skillId, RELATION_TYPES.CERTIFIES_SKILL);
    }
  }

  // 7. Connect Achievements <-> Activities & Experience
  for (let i = 0; i < (kb.achievements || []).length; i++) {
    const ach = kb.achievements[i];
    const achId = ach.id || `ach:${i}`;
    addNode(achId, 'achievement', ach.title, ach);
    addEdge(personId, achId, RELATION_TYPES.ACHIEVED);

    const activityLabel = ach.activityType || 'Extracurricular & Developer Activity';
    const activityId = `activity:${activityLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    if (!nodes.has(activityId)) {
      addNode(activityId, 'activity', activityLabel, { title: activityLabel });
    }
    addEdge(achId, activityId, RELATION_TYPES.ACHIEVEMENT_ACTIVITY);
    addEdge(activityId, achId, RELATION_TYPES.ACHIEVEMENT_ACTIVITY);
  }

  // 8. Connect explicit `relatedIds` across structured knowledge items
  for (const item of kb.allKnowledgeItems || []) {
    if (!item?.id) continue;
    for (const relId of item.relatedIds || []) {
      if (nodes.has(relId)) {
        addEdge(item.id, relId, RELATION_TYPES.RELATED_KNOWLEDGE);
      }
    }
  }

  /**
   * Finds all projects that use a given skill or technology name.
   */
  function getProjectsBySkill(skillName) {
    if (!skillName) return [];
    const target = skillName.toLowerCase().trim();
    const skillId = `skill:${target}`;

    const matchedProjectIds = edges
      .filter(
        (e) =>
          e.relation === RELATION_TYPES.USES_SKILL &&
          (e.to === skillId || e.to.includes(target))
      )
      .map((e) => e.from);

    return Array.from(new Set(matchedProjectIds))
      .map((id) => nodes.get(id)?.data)
      .filter(Boolean);
  }

  /**
   * Finds all technologies used by a given project ID or project title.
   */
  function getTechnologiesByProject(projectQuery) {
    if (!projectQuery) return [];
    const q = projectQuery.toLowerCase().trim();
    const projectNode = Array.from(nodes.values()).find(
      (n) =>
        n.type === 'project' &&
        (n.id.toLowerCase() === q || n.label.toLowerCase().includes(q))
    );
    if (!projectNode) return [];

    return edges
      .filter((e) => e.from === projectNode.id && e.relation === RELATION_TYPES.PROJECT_USES_TECH)
      .map((e) => nodes.get(e.to)?.label)
      .filter(Boolean);
  }

  /**
   * Finds activities connected to achievements.
   */
  function getActivitiesForAchievement(achievementQuery) {
    if (!achievementQuery) return [];
    const q = achievementQuery.toLowerCase().trim();
    const achNode = Array.from(nodes.values()).find(
      (n) =>
        (n.type === 'achievement' || n.type === 'Achievements') &&
        (n.id.toLowerCase() === q || n.label.toLowerCase().includes(q))
    );
    if (!achNode) return [];

    const relatedIds = edges
      .filter(
        (e) =>
          e.from === achNode.id &&
          (e.relation === RELATION_TYPES.ACHIEVEMENT_ACTIVITY ||
            e.relation === RELATION_TYPES.RELATED_KNOWLEDGE)
      )
      .map((e) => e.to);

    return relatedIds.map((id) => nodes.get(id)?.data || nodes.get(id)).filter(Boolean);
  }

  /**
   * Finds all certifications linked to a given skill name.
   */
  function getCertificationsBySkill(skillName) {
    if (!skillName) return [];
    const target = skillName.toLowerCase().trim();
    const skillId = `skill:${target}`;

    const matchedCertIds = edges
      .filter(
        (e) =>
          e.relation === RELATION_TYPES.CERTIFIES_SKILL &&
          (e.to === skillId || e.to.includes(target))
      )
      .map((e) => e.from);

    return Array.from(new Set(matchedCertIds))
      .map((id) => nodes.get(id)?.data)
      .filter(Boolean);
  }

  /**
   * Finds related projects sharing at least one skill or category with the given project title.
   */
  function getRelatedProjects(projectTitle) {
    if (!projectTitle) return [];
    const projectNode = Array.from(nodes.values()).find(
      (n) => n.type === 'project' && n.label.toLowerCase() === projectTitle.toLowerCase()
    );
    if (!projectNode) return [];

    const projectSkills = new Set(
      edges
        .filter((e) => e.from === projectNode.id && e.relation === RELATION_TYPES.USES_SKILL)
        .map((e) => e.to)
    );

    const relatedScores = new Map();
    for (const edge of edges) {
      if (
        edge.relation === RELATION_TYPES.USES_SKILL &&
        edge.from !== projectNode.id &&
        projectSkills.has(edge.to)
      ) {
        relatedScores.set(edge.from, (relatedScores.get(edge.from) || 0) + 1);
      }
    }

    return Array.from(relatedScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => nodes.get(id)?.data)
      .filter(Boolean);
  }

  /**
   * Graph-augmented knowledge retrieval for a user question.
   */
  function retrieveKnowledge(question, options = {}) {
    const baseResult = baseRetrieveKnowledge(question, options);
    return {
      ...baseResult,
      graphSummary: {
        totalNodes: nodes.size,
        totalEdges: edges.length,
      },
    };
  }

  return {
    nodes,
    edges,
    getNode: (id) => nodes.get(id) || null,
    getProjectsBySkill,
    getTechnologiesByProject,
    getActivitiesForAchievement,
    getCertificationsBySkill,
    getRelatedProjects,
    retrieveKnowledge,
  };
}

export const defaultKnowledgeGraph = createKnowledgeGraph(defaultKnowledge);

export default defaultKnowledgeGraph;
