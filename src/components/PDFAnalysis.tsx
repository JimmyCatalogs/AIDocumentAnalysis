import React, { useState, useEffect } from 'react';
import { testAWSCredentials, analyzePDF } from '../services/aws-pdf-service';

interface Analysis {
  summary: string;
  timestamp: Date;
  fileName: string;
}

const PDFAnalysis: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  useEffect(() => {
    testAWSCredentials()
      .then(isWorking => {
        console.log('AWS credentials working:', isWorking);
      })
      .catch(error => {
        console.error('AWS credentials test failed:', error);
        setError('Failed to connect to AWS services');
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
        setExtractedText(null);
        setAnalysis(null);
      } else {
        setError('Please select a PDF file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const result = await analyzePDF(file);

      // Split the result into full text and summary
      const [summaryPart, fullTextPart] = result.split('\nFull Text:\n');

      setExtractedText(fullTextPart);

      const analysisData: Analysis = {
        summary: summaryPart,
        timestamp: new Date(),
        fileName: file.name
      };

      setAnalysis(analysisData);
    } catch (err) {
      setError('Failed to analyze PDF. Please try again.');
      console.error('PDF analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">PDF Analysis</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF Document
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
        <button
          type="submit"
          disabled={!file || loading}
          className={`w-full px-4 py-2 rounded ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white font-medium`}
        >
          {loading ? (
            <span>Analyzing... This may take a moment</span>
          ) : (
            'Analyze PDF'
          )}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              ⚠️
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Left side - Full Text */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Document Text</h3>
          <div className="prose max-w-none">
            {extractedText ? (
              <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded text-sm">
                {extractedText}
              </pre>
            ) : (
              <p className="text-gray-500 italic">
                Upload and analyze a PDF to see its contents here
              </p>
            )}
          </div>
        </div>

        {/* Right side - Analysis */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">AI Analysis</h3>
          <div className="prose max-w-none">
            {loading ? (
              <div className="text-gray-500">
                Analyzing document... Please wait...
              </div>
            ) : analysis ? (
              <>
                <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded text-sm">
                  {analysis.summary}
                </pre>
                <p className="text-sm text-gray-500 mt-4">
                  Analyzed on: {analysis.timestamp.toLocaleString()}
                </p>
              </>
            ) : (
              <p className="text-gray-500 italic">
                Analysis results will appear here
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFAnalysis;