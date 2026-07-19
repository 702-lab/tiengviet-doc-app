import { supabase } from './supabaseClient';

export interface Chapter {
  id: string;
  title: string;
  order_index: number;
}

export interface Lesson {
  id: string;
  chapter_id: string;
  title: string;
  description: string;
  order_index: number;
  video_url?: string;
}

export interface Exercise {
  id: string;
  lesson_id: string;
  title: string;
  text: string;
  illustration: string;
  order_index: number;
}

export async function fetchSyllabus() {
  const { data: chapters, error: cError } = await supabase
    .from('chapters')
    .select('*')
    .order('order_index', { ascending: true });

  if (cError) {
    console.error('Error fetching chapters:', cError);
    return { chapters: [], lessons: [], exercises: [] };
  }

  const { data: lessons, error: lError } = await supabase
    .from('lessons')
    .select('*')
    .order('order_index', { ascending: true });

  if (lError) {
    console.error('Error fetching lessons:', lError);
    return { chapters: [], lessons: [], exercises: [] };
  }

  const { data: exercises, error: eError } = await supabase
    .from('exercises')
    .select('*')
    .order('order_index', { ascending: true });

  if (eError) {
    console.error('Error fetching exercises:', eError);
    return { chapters: [], lessons: [], exercises: [] };
  }

  return {
    chapters: chapters as Chapter[],
    lessons: lessons as Lesson[],
    exercises: exercises as Exercise[],
  };
}
