package org.vaadin.addons.componentfactory;

import java.util.ArrayList;
import java.util.List;

import org.vaadin.addons.componentfactory.PivotTable.PivotData;
import org.vaadin.addons.componentfactory.PivotTable.PivotMode;
import org.vaadin.addons.componentfactory.PivotTable.PivotOptions;
import org.vaadin.addons.componentfactory.PivotTable.customAgg;
import org.vaadin.addons.componentfactory.PivotTable.Renderer;

import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.dialog.Dialog;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.select.Select;
import com.vaadin.flow.router.Route;

@Route(value = "", layout = MainView.class)
public class PivotView extends Div {

    public PivotView() {
        PivotData pivotData = new PivotData();
        pivotData.addColumn("color", String.class);
        pivotData.addColumn("shape", String.class);
        pivotData.addColumn("size", Integer.class);
        pivotData.addColumn("weight", Integer.class);
        pivotData.addColumn("filled", Boolean.class);
        pivotData.addRow("blue", "circle", 2,1, true);
        pivotData.addRow("red", "triangle", 3,2, false);
        pivotData.addRow("orange", "square", 1,3, true);
        pivotData.addRow("yellow", "circle", 3,4, false);
        pivotData.addRow("brown", "circle", 2, 1, true);

        PivotOptions pivotOptions = new PivotOptions();
        pivotOptions.setRows("color");
        pivotOptions.setCols("shape");
        pivotOptions.setCharts(false);

        List<customAgg> customAggregators = new ArrayList<>();
        customAgg c1 = new customAgg(PivotTable.FunctionName.MAXIMUM,"Number of MPs","size");
        customAgg c2 = new customAgg(PivotTable.FunctionName.AVERAGE,"Average weight of MPs","weight");
        customAggregators.add(c1);
        customAggregators.add(c2);
        pivotOptions.setCustomAggregators(customAggregators);
        pivotOptions.setAggregator("Average", "size");

        PivotTable table = new PivotTable(pivotData, pivotOptions,
                PivotMode.INTERACTIVE);

        Button button = new Button("to Dialog");
        button.addClickListener(event -> {
            if (getChildren().anyMatch(child -> child == table)) {
                remove(table);
                button.setText("to Normal");
                Dialog dialog = new Dialog();
                dialog.add(table);
                dialog.setWidth("100%");
                dialog.setHeight("100%");
                dialog.open();
            } else {
                button.setText("to Dialog");
                add(table);
            }
        });

        add(button, table);
    }

}
