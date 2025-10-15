"""
Error correction and post-processing module.
Uses NLP models for grammar refinement and contextual spell-checking.
"""

import re
from typing import List, Dict, Optional
import logging

try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    logging.warning("spaCy not available. Error correction will be limited.")

try:
    from transformers import pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    logging.warning("Transformers not available. Advanced correction disabled.")

from config import get_settings

logger = logging.getLogger(__name__)


class ErrorCorrector:
    """
    Handles error correction and post-processing of transcripts.
    
    Features:
    - Grammar checking and correction
    - Contextual spell-checking
    - Punctuation refinement
    - Filler word removal
    - Capitalization correction
    """
    
    def __init__(self):
        """Initialize the error corrector."""
        self.settings = get_settings()
        self.nlp = None
        self.grammar_checker = None
        
        if SPACY_AVAILABLE:
            self._load_spacy_model()
        
        if TRANSFORMERS_AVAILABLE:
            self._load_grammar_checker()
    
    def _load_spacy_model(self):
        """Load spaCy language model."""
        try:
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("spaCy model loaded")
        except Exception as e:
            logger.error(f"Failed to load spaCy model: {e}")
            logger.info("Run: python -m spacy download en_core_web_sm")
    
    def _load_grammar_checker(self):
        """Load grammar checking model."""
        try:
            # Using a grammar correction model
            # Note: This can be heavy - consider using lighter alternatives
            self.grammar_checker = pipeline(
                "text2text-generation",
                model="pszemraj/flan-t5-large-grammar-synthesis",
                device=-1  # CPU
            )
            logger.info("Grammar checker loaded")
        except Exception as e:
            logger.error(f"Failed to load grammar checker: {e}")
    
    def correct_text(self, text: str) -> str:
        """
        Apply all corrections to text.
        
        Args:
            text: Raw transcribed text
            
        Returns:
            Corrected text
        """
        if not text or not self.settings.enable_error_correction:
            return text
        
        # Apply corrections in sequence
        text = self.remove_filler_words(text)
        text = self.fix_capitalization(text)
        text = self.fix_punctuation(text)
        text = self.correct_grammar(text)
        text = self.clean_whitespace(text)
        
        return text
    
    def remove_filler_words(self, text: str) -> str:
        """
        Remove common filler words and hesitations.
        
        Args:
            text: Input text
            
        Returns:
            Text with filler words removed
        """
        filler_words = [
            r'\buh\b', r'\bum\b', r'\buhm\b', r'\buhmm\b',
            r'\ber\b', r'\bah\b', r'\blike\b(?!\s+to)',  # 'like' except in 'like to'
            r'\byou know\b', r'\bi mean\b', r'\bbasically\b',
            r'\bactually\b', r'\bliterally\b(?!\s+(the|a|an))',
            r'\bkind of\b', r'\bsort of\b'
        ]
        
        for pattern in filler_words:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE)
        
        return text
    
    def fix_capitalization(self, text: str) -> str:
        """
        Fix capitalization issues.
        
        Args:
            text: Input text
            
        Returns:
            Text with corrected capitalization
        """
        if not self.nlp:
            # Simple fallback
            sentences = text.split('. ')
            sentences = [s.capitalize() for s in sentences]
            return '. '.join(sentences)
        
        # Use spaCy for sentence detection
        doc = self.nlp(text)
        
        corrected = []
        for sent in doc.sents:
            sent_text = sent.text.strip()
            if sent_text:
                # Capitalize first letter
                sent_text = sent_text[0].upper() + sent_text[1:]
                corrected.append(sent_text)
        
        return ' '.join(corrected)
    
    def fix_punctuation(self, text: str) -> str:
        """
        Add or fix punctuation.
        
        Args:
            text: Input text
            
        Returns:
            Text with improved punctuation
        """
        # Remove multiple spaces
        text = re.sub(r'\s+', ' ', text)
        
        # Add period at end if missing
        if text and not text[-1] in '.!?':
            text += '.'
        
        # Fix spacing around punctuation
        text = re.sub(r'\s+([.,!?;:])', r'\1', text)
        text = re.sub(r'([.,!?;:])(?=[^\s])', r'\1 ', text)
        
        # Fix multiple punctuation
        text = re.sub(r'\.{2,}', '.', text)
        text = re.sub(r'\?{2,}', '?', text)
        text = re.sub(r'!{2,}', '!', text)
        
        return text
    
    def correct_grammar(self, text: str) -> str:
        """
        Correct grammar using NLP model.
        
        Args:
            text: Input text
            
        Returns:
            Text with corrected grammar
        """
        if not self.grammar_checker:
            return text
        
        try:
            # Split into sentences to avoid token limits
            sentences = text.split('. ')
            corrected_sentences = []
            
            for sentence in sentences:
                if len(sentence.strip()) < 5:  # Skip very short sentences
                    corrected_sentences.append(sentence)
                    continue
                
                result = self.grammar_checker(
                    sentence,
                    max_length=512,
                    num_return_sequences=1
                )
                
                if result and len(result) > 0:
                    corrected_sentences.append(result[0]['generated_text'])
                else:
                    corrected_sentences.append(sentence)
            
            return '. '.join(corrected_sentences)
            
        except Exception as e:
            logger.error(f"Grammar correction error: {e}")
            return text
    
    def clean_whitespace(self, text: str) -> str:
        """
        Clean up whitespace issues.
        
        Args:
            text: Input text
            
        Returns:
            Text with cleaned whitespace
        """
        # Remove leading/trailing whitespace
        text = text.strip()
        
        # Replace multiple spaces with single space
        text = re.sub(r'\s+', ' ', text)
        
        # Remove spaces before punctuation
        text = re.sub(r'\s+([.,!?;:])', r'\1', text)
        
        # Ensure space after punctuation
        text = re.sub(r'([.,!?;:])([^\s])', r'\1 \2', text)
        
        return text
    
    def extract_keywords(self, text: str) -> List[str]:
        """
        Extract keywords from text.
        
        Args:
            text: Input text
            
        Returns:
            List of keywords
        """
        if not self.nlp:
            # Simple fallback - extract longer words
            words = text.split()
            return [w for w in words if len(w) > 5]
        
        doc = self.nlp(text)
        
        # Extract nouns and proper nouns
        keywords = []
        for token in doc:
            if token.pos_ in ['NOUN', 'PROPN'] and not token.is_stop:
                keywords.append(token.text.lower())
        
        # Get unique keywords
        return list(set(keywords))
    
    def summarize_text(self, text: str, max_sentences: int = 3) -> str:
        """
        Create a summary of the text.
        
        Args:
            text: Input text
            max_sentences: Maximum sentences in summary
            
        Returns:
            Summarized text
        """
        if not self.nlp:
            # Simple fallback - return first N sentences
            sentences = text.split('. ')
            return '. '.join(sentences[:max_sentences]) + '.'
        
        doc = self.nlp(text)
        sentences = list(doc.sents)
        
        if len(sentences) <= max_sentences:
            return text
        
        # Simple extractive summary - take first N sentences
        # In production, use proper summarization algorithms
        summary = ' '.join(str(sent) for sent in sentences[:max_sentences])
        
        return summary
