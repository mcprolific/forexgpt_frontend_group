import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

class CodeGenerationService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.userId = null;
  }

  // Set user ID after authentication
  setUserId(userId) {
    this.userId = userId;
  }

  // Generate new trading strategy code
  async generateCode(prompt, language = 'python', framework = 'pandas') {
    try {
      const response = await this.api.post('/generate', {
        user_id: this.userId,
        prompt: prompt,
        language: language,
        framework: framework,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error generating code:', error);
      throw error;
    }
  }

  // Debug existing code
  async debugCode(code, error_message = null) {
    try {
      const response = await this.api.post('/debug', {
        user_id: this.userId,
        code: code,
        error_message: error_message,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error debugging code:', error);
      throw error;
    }
  }

  // Modify existing code
  async modifyCode(code, instructions) {
    try {
      const response = await this.api.post('/modify', {
        user_id: this.userId,
        code: code,
        instructions: instructions,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error modifying code:', error);
      throw error;
    }
  }

  // Explain code
  async explainCode(code) {
    try {
      const response = await this.api.post('/explain', {
        user_id: this.userId,
        code: code,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error explaining code:', error);
      throw error;
    }
  }
}

export default new CodeGenerationService();