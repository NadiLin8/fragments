const MarkdownIt = require('markdown-it');

class FragmentConverter {
  constructor() {
    this.md = new MarkdownIt();
  }

  static getValidExtensions(type) {
    const conversions = {
      'text/plain': ['.txt'],
      'text/markdown': ['.md', '.html', '.txt'],
      'text/html': ['.html', '.txt'],
      'text/csv': ['.csv', '.txt', '.json'],
      'application/json': ['.json', '.yaml', '.yml', '.txt'],
      'application/yaml': ['.yaml', '.txt']
    };
    
    return conversions[type] || [];
  }

  static isValidConversion(fromType, toExtension) {
    const validExtensions = this.getValidExtensions(fromType);
    return validExtensions.includes(toExtension);
  }

  convert(data, fromType, toExtension) {
    if (fromType === 'text/markdown' && toExtension === '.html') {
      return {
        data: this.md.render(data.toString()),
        contentType: 'text/html'
      };
    }

    if (fromType === 'text/markdown' && toExtension === '.txt') {
      return {
        data: data.toString(),
        contentType: 'text/plain'
      };
    }

    if ((fromType === 'text/plain' && toExtension === '.txt') ||
        (fromType === 'text/html' && toExtension === '.html') ||
        (fromType === 'application/json' && toExtension === '.json')) {
      return {
        data: data.toString(),
        contentType: fromType
      };
    }

    throw new Error(`Conversion from ${fromType} to ${toExtension} not supported`);
  }
}

module.exports = FragmentConverter;
