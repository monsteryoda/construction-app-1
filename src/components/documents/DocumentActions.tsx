import { supabase } from '@/integrations/supabase/client';

export const uploadFiles = async (documentId: string, userId: string, files: File[]): Promise<number> => {
  let uploadedCount = 0;

  for (const file of files) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('document_files')
      .upload(`${documentId}/${fileName}`, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      continue;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('document_files')
      .getPublicUrl(uploadData.path);

    const { error: dbError } = await supabase
      .from('document_files')
      .insert([{
        document_id: documentId,
        user_id: userId,
        file_url: publicUrl,
        file_name: fileName,
        file_size: file.size,
      }]);

    if (!dbError) {
      uploadedCount++;
    }
  }

  return uploadedCount;
};

export const deleteDocumentFile = async (fileId: string): Promise<void> => {
  try {
    const { data: fileData, error: fetchError } = await supabase
      .from('document_files')
      .select('file_url, path')
      .eq('id', fileId)
      .single();

    if (fetchError) throw fetchError;

    // Extract path from file_url
    const path = fileData.file_url.split('/').slice(-2).join('/');

    // Delete from storage
    await supabase.storage
      .from('document_files')
      .remove([path]);

    // Delete from database
    const { error: deleteError } = await supabase
      .from('document_files')
      .delete()
      .eq('id', fileId);

    if (deleteError) throw deleteError;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};