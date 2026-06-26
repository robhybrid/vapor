import { useEffect } from 'react';
import { marked } from 'marked';
import { useAppStore } from '../store/useAppStore';
import controlsMd from '../content/controls.md?raw';
import './Help.css';

export default function Help() {
  const helpHtml = useAppStore((s) => s.helpHtml);

  useEffect(() => {
    useAppStore.getState().setField('helpHtml', marked.parse(controlsMd));

    const close = () => useAppStore.getState().setField('showHelp', false);
    window.addEventListener('keypress', close);
    window.addEventListener('click', close);

    return () => {
      window.removeEventListener('keypress', close);
      window.removeEventListener('click', close);
    };
  }, []);

  return (
    <div className="help">
      <a href="https://github.com/robhybrid/vapor" className="fork">
        <img
          loading="lazy"
          width="149"
          height="149"
          src="https://github.blog/wp-content/uploads/2008/12/forkme_right_white_ffffff.png?resize=149%2C149"
          alt="Fork me on GitHub"
        />
      </a>
      <div dangerouslySetInnerHTML={{ __html: helpHtml }} />
    </div>
  );
}
