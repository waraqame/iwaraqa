import { db } from '../lib/db';
import type { Project, Section } from '../lib/db';

export async function createProject(userId: number, title: string, language: string): Promise<number> {
  try {
    const now = new Date();
    const projectId = await db.transaction('rw', [db.projects, db.sections], async () => {
      // Create project
      const id = await db.projects.add({
        userId,
        title,
        language,
        progress: 0,
        createdAt: now,
        updatedAt: now
      });

      // Create empty sections
      const sectionTypes = ['title', 'abstract', 'introduction', 'methodology', 'results', 'discussion', 'conclusion'];
      await Promise.all(sectionTypes.map(type => 
        db.sections.add({
          projectId: id,
          type,
          content: '',
          wordCount: 0,
          aiUsageCount: 0,
          createdAt: now,
          updatedAt: now
        })
      ));

      return id;
    });

    return projectId;
  } catch (error) {
    console.error('[Projects] Error creating project:', error);
    throw error;
  }
}

export async function getProject(projectId: string | number, userId: number): Promise<Project & { sections: Section[] }> {
  try {
    const id = typeof projectId === 'string' ? parseInt(projectId) : projectId;
    
    const project = await db.projects.get(id);
    if (!project || project.userId !== userId) {
      throw new Error('Project not found');
    }

    const sections = await db.sections
      .where('projectId')
      .equals(id)
      .toArray();

    return { ...project, sections };
  } catch (error) {
    console.error('[Projects] Error getting project:', error);
    throw error;
  }
}

export async function updateSection(projectId: number, type: string, content: string): Promise<void> {
  try {
    const now = new Date();
    await db.transaction('rw', [db.sections, db.projects], async () => {
      // Update section
      await db.sections
        .where('[projectId+type]')
        .equals([projectId, type])
        .modify({
          content,
          wordCount: content.trim().split(/\s+/).length,
          updatedAt: now
        });

      // Update project progress
      const sections = await db.sections
        .where('projectId')
        .equals(projectId)
        .toArray();

      const progress = Math.round(
        (sections.filter(s => s.content.trim().length > 0).length / sections.length) * 100
      );

      await db.projects
        .where('id')
        .equals(projectId)
        .modify({
          progress,
          updatedAt: now
        });
    });
  } catch (error) {
    console.error('[Projects] Error updating section:', error);
    throw error;
  }
}

export async function getUserProjects(userId: number): Promise<Project[]> {
  try {
    return await db.projects
      .where('userId')
      .equals(userId)
      .reverse()
      .sortBy('updatedAt');
  } catch (error) {
    console.error('[Projects] Error getting user projects:', error);
    throw error;
  }
}

export async function deleteProject(projectId: number): Promise<void> {
  try {
    await db.transaction('rw', [db.projects, db.sections], async () => {
      await db.sections.where('projectId').equals(projectId).delete();
      await db.projects.delete(projectId);
    });
  } catch (error) {
    console.error('[Projects] Error deleting project:', error);
    throw error;
  }
}