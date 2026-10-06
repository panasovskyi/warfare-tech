import Markdown from 'react-markdown';
import styles from './ArticleBody.module.scss';

type Props = {
  body: string;
};

export const ArticleBody: React.FC<Props> = ({ body }) => {
  return (
    <div className={styles.body}>
      <Markdown>
        {body}
      </Markdown>
    </div>
  )
}