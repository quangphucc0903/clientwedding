import React, { useState } from "react";
import { Box } from "@mui/material";
import { useDrop } from "react-dnd";
import ComponentItem from "./ComponentItem";

const Section = ({
  section,
  index,
  setSections,
  setActiveItem,
  activeItem,
  sections,
  setActiveStyles,
  selectedItem,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [guides, setGuides] = useState({
    vertical: [],
    horizontal: [],
    snapLines: [],
    centerVertical: [],
    centerHorizontal: [],
  });

  const [, dropRef] = useDrop(() => ({
    accept: "component",
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const dropPosition = {
        left: offset.x - monitor.getSourceClientOffset().x,
        top: offset.y - monitor.getSourceClientOffset().y,
      };

      const newComponent = {
        id: Date.now().toString(),
        type: item.type,
        style: {
          ...dropPosition,
          width: item.type === "diamond" ? 50 : 100,
          height: item.type === "line" ? 5 : 50,
          fontSize: 16,
          color: "#000",
        },
      };

      setSections((prevSections) => {
        const newSections = [...prevSections];
        newSections[index].components.push(newComponent);
        return newSections;
      });
    },
  }));

  const calculateFigmaLikeGuides = (compId, newPosition) => {
    const { left, top, width, height } = newPosition;
    let newGuides = {
      vertical: [],
      horizontal: [],
      snapLines: [],
      centerVertical: [],
      centerHorizontal: [],
    };

    (section.components || []).forEach((comp) => {
      if (comp.id !== compId) {
        const compLeft = comp.style.left;
        const compTop = comp.style.top;
        const compWidth = comp.style.width;
        const compHeight = comp.style.height;

        // Vertical Alignment
        if (Math.abs(left - compLeft) < 5) newGuides.vertical.push(compLeft);
        if (Math.abs(left + width / 2 - (compLeft + compWidth / 2)) < 5)
          newGuides.centerVertical.push(compLeft + compWidth / 2);
        if (Math.abs(left + width - (compLeft + compWidth)) < 5)
          newGuides.vertical.push(compLeft + compWidth);

        // Horizontal Alignment
        if (Math.abs(top - compTop) < 5) newGuides.horizontal.push(compTop);
        if (Math.abs(top + height / 2 - (compTop + compHeight / 2)) < 5)
          newGuides.centerHorizontal.push(compTop + compHeight / 2);
        if (Math.abs(top + height - (compTop + compHeight)) < 5)
          newGuides.horizontal.push(compTop + compHeight);

        // Spacing Guides (Equidistant Spacing)
        if (Math.abs(top - (compTop + compHeight)) < 5)
          newGuides.snapLines.push({ top: compTop + compHeight });
        if (Math.abs(left - (compLeft + compWidth)) < 5)
          newGuides.snapLines.push({ left: compLeft + compWidth });
        if (Math.abs(top + height - compTop) < 5)
          newGuides.snapLines.push({ top: compTop });
        if (Math.abs(left + width - compLeft) < 5)
          newGuides.snapLines.push({ left: compLeft });
      }
    });
    return newGuides;
  };

  const handleDragComponent = (compId, newPosition) => {
    const newGuides = calculateFigmaLikeGuides(compId, newPosition);

    // Snap to closest guide if within threshold
    if (newGuides.vertical.length > 0) {
      const closestVertical = newGuides.vertical.reduce((prev, curr) =>
        Math.abs(curr - newPosition.left) < Math.abs(prev - newPosition.left)
          ? curr
          : prev
      );
      if (Math.abs(closestVertical - newPosition.left) < 5) {
        newPosition.left = closestVertical;
      }
    }

    if (newGuides.horizontal.length > 0) {
      const closestHorizontal = newGuides.horizontal.reduce((prev, curr) =>
        Math.abs(curr - newPosition.top) < Math.abs(prev - newPosition.top)
          ? curr
          : prev
      );
      if (Math.abs(closestHorizontal - newPosition.top) < 5) {
        newPosition.top = closestHorizontal;
      }
    }

    setSections((prevSections) => {
      const newSections = [...prevSections];
      const componentIndex = newSections[index].components.findIndex(
        (comp) => comp.id === compId
      );
      if (componentIndex !== -1) {
        newSections[index].components[componentIndex].style = {
          ...newSections[index].components[componentIndex].style,
          ...newPosition,
        };
      }
      return newSections;
    });

    setGuides(newGuides);
  };

  const handleDeleteComponent = (compId) => {
    setSections((prevSections) => {
      const newSections = [...prevSections];
      newSections[index].components = newSections[index].components.filter(
        (comp) => comp.id !== compId
      );
      return newSections;
    });
    setGuides({
      vertical: [],
      horizontal: [],
      snapLines: [],
      centerVertical: [],
      centerHorizontal: [],
    });
  };

  const handleDoubleClick = () => {
    if (setActiveStyles) {
      setActiveItem({ sectionId: section.id, componentId: null });
      setActiveStyles({ backgroundColor: section.backgroundColor || "#fff" });
    } else {
      console.error("setActiveStyles is not available");
      setActiveItem(null);
      setGuides({
        vertical: [],
        horizontal: [],
        snapLines: [],
        centerVertical: [],
        centerHorizontal: [],
      });
    }
  };

  return (
    <Box
      onDoubleClick={handleDoubleClick}
      ref={dropRef}
      sx={{
        position: section.style.position,
        border: isHovered ? "2px solid #2196f3" : "1px dashed #ccc",
        padding: section.style.padding,
        marginBottom: section.style.marginBottom,
        minWidth: section.style.minWidth,
        minHeight: section.style.minHeight,
        backgroundColor: section.style.backgroundColor,
        transition: section.style.transition,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {(guides.vertical || []).map((position, index) => (
        <Box
          key={`v-${index}`}
          sx={{
            position: "absolute",
            left: position,
            top: Math.min(...section.components.map((comp) => comp.style.top)),
            height:
              Math.max(
                ...section.components.map(
                  (comp) => comp.style.top + comp.style.height
                )
              ) - Math.min(...section.components.map((comp) => comp.style.top)),
            width: "1.25px",
            backgroundColor: "#B74022",
            zIndex: 10,
            opacity: 0.7,
          }}
        />
      ))}
      {(guides.horizontal || []).map((position, index) => (
        <Box
          key={`h-${index}`}
          sx={{
            position: "absolute",
            top: position,
            left: Math.min(
              ...section.components.map((comp) => comp.style.left)
            ),
            width:
              Math.max(
                ...section.components.map(
                  (comp) => comp.style.left + comp.style.width
                )
              ) -
              Math.min(...section.components.map((comp) => comp.style.left)),
            height: "1.25px",
            backgroundColor: "#B74022",
            zIndex: 10,
            opacity: 0.7,
          }}
        />
      ))}
      {(guides.centerVertical || []).map((position, index) => (
        <Box
          key={`cv-${index}`}
          sx={{
            position: "absolute",
            left: position,
            top: Math.min(...section.components.map((comp) => comp.style.top)),
            height:
              Math.max(
                ...section.components.map(
                  (comp) => comp.style.top + comp.style.height
                )
              ) - Math.min(...section.components.map((comp) => comp.style.top)),
            width: "1.25px",
            backgroundColor: "#B74022",
            zIndex: 10,
            opacity: 0.7,
          }}
        />
      ))}
      {(guides.centerHorizontal || []).map((position, index) => (
        <Box
          key={`ch-${index}`}
          sx={{
            position: "absolute",
            top: position,
            left: Math.min(
              ...section.components.map((comp) => comp.style.left)
            ),
            width:
              Math.max(
                ...section.components.map(
                  (comp) => comp.style.left + comp.style.width
                )
              ) -
              Math.min(...section.components.map((comp) => comp.style.left)),
            height: "1.25px",
            backgroundColor: "#B74022",
            zIndex: 10,
            opacity: 0.7,
          }}
        />
      ))}
      {(section.components || []).map((component) => (
        <ComponentItem
          key={component.id}
          selected={selectedItem?.componentId === component.id}
          component={component}
          onDrag={(newPosition) =>
            handleDragComponent(component.id, newPosition)
          }
          active={activeItem?.componentId === component.id}
          setActiveItem={() =>
            setActiveItem({ sectionId: section.id, componentId: component.id })
          }
          setActiveStyles={() => setActiveStyles(component.style)}
          handleDelete={() => handleDeleteComponent(component.id)}
          setGuides={setGuides}
        />
      ))}
    </Box>
  );
};

export default Section;
