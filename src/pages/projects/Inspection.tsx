) : (
                      <div
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="w-full h-40 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            document.getElementById('image-upload')?.click();
                          }
                        }}
                      >
                        <ImageIcon className="w-12 h-12 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">Click to attach photos</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB each</p>
                      </div>
                    )}
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />