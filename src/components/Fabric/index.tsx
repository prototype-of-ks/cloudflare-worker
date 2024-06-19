import { useRef, useEffect } from 'react';
import { fabric } from 'fabric';

const FabricCanvas = () => {
  const canvasRef = useRef(null);
  const fabricRef = useRef<fabric.Canvas>();

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current);
    fabricRef.current = canvas;

    const box = new fabric.Textbox('Text Box', {
      left: 100,
      top: 50,
      fontFamily: 'Arial', // 设置字体
      fontSize: 16, // 设置字体大小
      fill: 'gray', // 设置浅蓝色字体颜色
      textAlign: 'center', // 设置文字对齐方式
    });

    const text = new fabric.Text('Zoom App Notification', {
      left: 100,
      top: 20,
      fontFamily: 'Arial', // 设置字体
      fontSize: 16, // 设置字体大小
      fill: 'gray', // 设置浅蓝色字体颜色
      textAlign: 'center', // 设置文字对齐方式
    });

    canvas.add(text);
    canvas.add(box);

    const handleResize = () => {
      canvas.setWidth(window.innerWidth * 0.6);
      canvas.setHeight(window.innerHeight * 0.6);
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial size

    // Clean up on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="flex justify-center items-center border-[gray] border-[1px] rounded-xl"
      width={640}
      height={480}
    />
  );
};

export default FabricCanvas;
