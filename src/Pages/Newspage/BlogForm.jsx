import Button from 'react-bootstrap/Button';
import { Form, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useState, useEffect, useCallback } from 'react';
import { useFirestore } from '../../Hook/useFirestore';
import { useAuthContext } from '../../Hook/useAuthContext';
import { useStorage } from '../../Hook/useStorage';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';

function PostForm() {
    const { addDocument } = useFirestore('Blog');
    const { user } = useAuthContext();
    const { uid, displayName, photoURL } = user;
    const { uploadMedia, urls, paths, clearMedia } = useStorage('Blog');
    const navigate = useNavigate();

    const [imageVideo, setImageVideo] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState({ ops: [] }); // Initialize as Delta
    const [view] = useState(0);
    const [share] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [category, setCategory] = useState('Blog');


    //word document format for adding post
    const modules = {
        toolbar: {
            container: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ indent: '-1' }, { indent: '+1' }],
                [{ align: [] }],
                ['clean'],
                [{ color: [] }, { background: [] }],
                [{ font: [] }],
                [{ size: ['small', false, 'large', 'huge'] }],
              ],
            },
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet', 'indent',
        'align',
        'color', 'background',
        'font', 'size'
      ];

      const handleChange = useCallback((value, delta, source, editor) => {
        setDescription(value);
    
      }, []);


    const handlePost = (e) => {
        const file = e.target.files[0];

        if (!file.type.includes('image')) {
            alert("The selected file must be an image");
            return;
        }

        if (file.size > 20000000) {
            alert('File size must be less than 20MB');
            return;
        }

        setImageVideo([file]);
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (imageVideo.length) {
            try {
                await uploadMedia(imageVideo);
                setIsSubmitted(true);
            } catch (err) {
                alert("Error during upload:", err.message);
                setIsLoading(false);
            }
        } else {
            setIsSubmitted(true);
        }
    };

    useEffect(() => {
        if (isSubmitted && (urls.length > 0 || imageVideo.length === 0)) {
            const doc = {
                uid: uid,
                displayName: displayName,
                photoURL: photoURL,
                imageURL: urls.length > 0 ? urls : null,
                imagePath: paths.length > 0 ? paths : null,
                title: title,
                category: category, 
                description: description, // This will save the Delta object
                view: view,
                share: share,
            };

            addDocument(doc)
                .then(() => {
                    console.log("Document added successfully:", doc);
                    setImageVideo([]);
                    setTitle('');
                    setDescription({ ops: [] }); // Reset to empty Delta
                    setIsSubmitted(false);
                    setIsLoading(false);
                    clearMedia();
                    navigate('/blog');
                })
                .catch((err) => {
                    alert("Error adding document:", err.message);
                    setIsLoading(false);
                });
        }
    }, [isSubmitted, urls, paths]);

    return (
        <Container fluid className='mb-5'>
            <Row className="justify-content-md-center">
                <Col md={8}>
                    <h1 className="mt-5">Post Blog</h1>
                    {isLoading ? (
                        <div className="d-flex justify-content-center">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="formTitle">
                                <Form.Label>Post Title</Form.Label>
                                <Form.Control
                                    type="text" 
                                    placeholder="Title..."
                                    onChange={(e) => setTitle(e.target.value)}
                                    value={title} 
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formDescription">
                                <Form.Label>Description</Form.Label>
                                <div style={{ height: '300px', marginBottom: '50px' }}>
                                    <ReactQuill 
                                        theme="snow" 
                                        modules={modules}
                                        formats={formats}
                                        value={description} 
                                        onChange={handleChange}
                                        style={{ height: '250px' }}
                                    />
                                </div>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formMedia">
                                <Form.Label>Image/Video (optional)</Form.Label>
                                <Form.Control type="file"  onChange={handlePost} />
                            </Form.Group>
                            <Button variant="danger" className='custom-button me-2' type="submit">
                                Submit
                            </Button>
                            <Button variant="danger" className='custom-button me-2' onClick={() => navigate('/blog')}>
                                close
                            </Button>
                        </Form>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default PostForm;