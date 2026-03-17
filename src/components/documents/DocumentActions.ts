"use client";

import { supabase } from '@/integrations/supabase/client';

export const uploadFiles = async (documentId: string, userId: string, files: File[]): Promise<number> => {
  try {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${documentId}/${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('project-documents')
        .getPublicUrl(filePath);

      // Store file reference in database
      const { data, error } = await supabase
        .from('project_documents')
        .update({ file_url: publicUrlData.publicUrl })
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        console.error('Error storing file:', error);
        throw error;
      }

      uploadedUrls.push(publicUrlData.publicUrl);
    }

    return uploadedUrls.length;
  } catch (error) {
    console.error('[uploadFiles] Error:', error);
    throw error;
  }
};

export const deleteDocumentFile = async (fileId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('project_documents')
      .delete()
      .eq('id', fileId);

    if (error) throw error;
  } catch (error) {
    console.error('[deleteDocumentFile] Error:', error);
    throw error;
  }
};